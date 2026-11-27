// Private admin API for the Datable lead list (page /admin).
//
// - The admin passcode is defined only by the site owner, as the secret environment
//   variable ADMIN_PASSCODE in the Netlify dashboard. There is no public route to create,
//   change or reset it.
// - Leads are read server-side from Netlify Forms (form "lead") with a Netlify personal
//   access token stored in the secret environment variable NETLIFY_FORMS_TOKEN. Neither
//   value is ever sent to the browser.
// - Sessions are short-lived signed cookies (HttpOnly, Secure, SameSite=Strict), so no
//   token is readable by page scripts.
// - Failed logins are counted in Netlify Blobs: an IP is locked after repeated failures,
//   and all logins pause if failures spike from many IPs.
import { getStore } from "@netlify/blobs";
import type { Config, Context } from "@netlify/functions";
import { createHash, createHmac, randomBytes, timingSafeEqual } from "node:crypto";

const COOKIE = "datable_admin";
const SESSION_SECONDS = 8 * 3600;
const MIN_PASSCODE_LENGTH = 12;

const IP_MAX_FAILURES = 5;
const IP_WINDOW_MS = 15 * 60 * 1000;
const IP_LOCK_MS = 15 * 60 * 1000;
const GLOBAL_MAX_FAILURES = 30;
const GLOBAL_WINDOW_MS = 60 * 60 * 1000;
const GLOBAL_LOCK_MS = 15 * 60 * 1000;

const FORM_NAME = "lead";
const MAX_PAGES = 50;
const PER_PAGE = 100;

const UNAVAILABLE = "Le service est indisponible pour le moment.";

type Counter = { failures: number; windowStart: number; lockedUntil: number };

const sha256 = (value: string) => createHash("sha256").update(value).digest();

const json = (body: unknown, status = 200, extraHeaders: Record<string, string> = {}) =>
  new Response(JSON.stringify(body), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store",
      "X-Robots-Tag": "noindex, nofollow",
      ...extraHeaders,
    },
  });

function readConfig() {
  const passcode = Netlify.env.get("ADMIN_PASSCODE") ?? "";
  const formsToken = Netlify.env.get("NETLIFY_FORMS_TOKEN") ?? "";
  return {
    passcode,
    formsToken,
    passcodeReady: passcode.length >= MIN_PASSCODE_LENGTH,
    tokenReady: formsToken.length > 0,
  };
}

// The signing key depends on both secrets: changing the passcode (or the token)
// immediately invalidates every open session.
const signingKey = (passcode: string, formsToken: string) =>
  sha256(`datable-admin-session|${passcode}|${formsToken}`);

function signSession(passcode: string, formsToken: string) {
  const expires = Math.floor(Date.now() / 1000) + SESSION_SECONDS;
  const nonce = randomBytes(16).toString("hex");
  const payload = `${expires}.${nonce}`;
  const mac = createHmac("sha256", signingKey(passcode, formsToken)).update(payload).digest("hex");
  return `${payload}.${mac}`;
}

function verifySession(value: string | undefined, passcode: string, formsToken: string) {
  if (!value) return false;
  const parts = value.split(".");
  if (parts.length !== 3) return false;
  const [expires, nonce, mac] = parts;
  if (!/^\d+$/.test(expires) || Number(expires) * 1000 < Date.now()) return false;
  const expected = createHmac("sha256", signingKey(passcode, formsToken))
    .update(`${expires}.${nonce}`)
    .digest();
  const given = Buffer.from(mac, "hex");
  return given.length === expected.length && timingSafeEqual(given, expected);
}

const passcodeMatches = (candidate: string, passcode: string) =>
  timingSafeEqual(sha256(candidate), sha256(passcode));

function sessionCookie(value: string, maxAge: number) {
  return `${COOKIE}=${value}; Path=/api/admin; Max-Age=${maxAge}; HttpOnly; Secure; SameSite=Strict`;
}

// Only same-origin JSON requests may change state (login, logout).
function isSameOriginJson(req: Request) {
  const origin = req.headers.get("origin");
  if (origin && origin !== new URL(req.url).origin) return false;
  return (req.headers.get("content-type") ?? "").includes("application/json");
}

const securityStore = () => getStore({ name: "admin-security", consistency: "strong" });

async function readCounter(key: string): Promise<Counter> {
  const stored = (await securityStore().get(key, { type: "json" })) as Counter | null;
  return stored ?? { failures: 0, windowStart: Date.now(), lockedUntil: 0 };
}

async function recordFailure(key: string, max: number, windowMs: number, lockMs: number) {
  const now = Date.now();
  const counter = await readCounter(key);
  if (now - counter.windowStart > windowMs) {
    counter.failures = 0;
    counter.windowStart = now;
  }
  counter.failures += 1;
  if (counter.failures >= max) {
    counter.lockedUntil = now + lockMs;
    counter.failures = 0;
    counter.windowStart = now;
  }
  await securityStore().setJSON(key, counter);
  return counter;
}

const ipKey = (ip: string) => `login-ip/${sha256(ip || "unknown").toString("hex")}`;
const GLOBAL_KEY = "login-global";

type NetlifySubmission = {
  id: string;
  created_at: string;
  data?: Record<string, unknown>;
  email?: string;
};

const text = (value: unknown) => (typeof value === "string" ? value : "");

async function fetchLeads(siteId: string, token: string) {
  const headers = { Authorization: `Bearer ${token}`, "User-Agent": "datable-admin" };
  const formsResponse = await fetch(`https://api.netlify.com/api/v1/sites/${siteId}/forms`, { headers });
  if (!formsResponse.ok) throw new Error(`forms HTTP ${formsResponse.status}`);
  const forms = (await formsResponse.json()) as Array<{ id: string; name: string }>;
  const form = forms.find((item) => item.name === FORM_NAME);
  if (!form) return [];

  const leads: Array<Record<string, string>> = [];
  let next: string | null =
    `https://api.netlify.com/api/v1/forms/${form.id}/submissions?per_page=${PER_PAGE}&page=1`;

  for (let page = 0; next && page < MAX_PAGES; page += 1) {
    const response: Response = await fetch(next, { headers });
    if (!response.ok) throw new Error(`submissions HTTP ${response.status}`);
    const batch = (await response.json()) as NetlifySubmission[];
    for (const item of batch) {
      const data = item.data ?? {};
      leads.push({
        id: item.id,
        email: text(data.email) || text(item.email),
        source: text(data.source),
        offer: text(data.offer),
        language: text(data.language),
        created_at: item.created_at,
      });
    }
    const link = response.headers.get("link") ?? "";
    next = /<([^>]+)>;\s*rel="next"/.exec(link)?.[1] ?? null;
    if (next && !next.startsWith("https://api.netlify.com/")) next = null;
  }

  return leads;
}

export default async (req: Request, context: Context) => {
  // Some proxies retry POSTs on pretty-URL variants (login.htm, login/index.html):
  // keep only the first path segment, without extension.
  const action = new URL(req.url).pathname
    .replace(/^\/api\/admin\/?/, "")
    .split("/")[0]
    .replace(/\.html?$/, "");
  const config = readConfig();
  const configured = config.passcodeReady && config.tokenReady;

  if (action === "status" && req.method === "GET") {
    const authenticated =
      configured && verifySession(context.cookies.get(COOKIE), config.passcode, config.formsToken);
    return json({ ok: true, configured, authenticated });
  }

  if (action === "login" && req.method === "POST") {
    if (!isSameOriginJson(req)) return json({ ok: false, error: "Requête refusée." }, 403);
    if (!configured) {
      console.error("[admin-leads] accès non configuré (variables d'environnement manquantes ou code trop court)");
      return json({ ok: false, error: "L'accès administrateur n'est pas encore configuré." }, 503);
    }

    const now = Date.now();
    const key = ipKey(context.ip);
    let ipCounter: Counter;
    let globalCounter: Counter;
    try {
      [ipCounter, globalCounter] = await Promise.all([readCounter(key), readCounter(GLOBAL_KEY)]);
    } catch (error) {
      console.error("[admin-leads] protection anti-tentatives indisponible", error);
      return json({ ok: false, error: UNAVAILABLE }, 503);
    }
    if (ipCounter.lockedUntil > now || globalCounter.lockedUntil > now) {
      const until = Math.max(ipCounter.lockedUntil, globalCounter.lockedUntil);
      const minutes = Math.ceil((until - now) / 60000);
      return json(
        { ok: false, error: `Trop de tentatives. Réessayez dans ${minutes} minute${minutes > 1 ? "s" : ""}.` },
        429,
        { "Retry-After": String(Math.ceil((until - now) / 1000)) },
      );
    }

    const body = (await req.json().catch(() => ({}))) as { passcode?: unknown };
    const candidate = typeof body.passcode === "string" ? body.passcode.slice(0, 256) : "";

    if (!candidate || !passcodeMatches(candidate, config.passcode)) {
      await Promise.all([
        recordFailure(key, IP_MAX_FAILURES, IP_WINDOW_MS, IP_LOCK_MS),
        recordFailure(GLOBAL_KEY, GLOBAL_MAX_FAILURES, GLOBAL_WINDOW_MS, GLOBAL_LOCK_MS),
      ]).catch((error) => console.error("[admin-leads] enregistrement de l'échec impossible", error));
      console.warn("[admin-leads] code d'accès refusé");
      await new Promise((resolve) => setTimeout(resolve, 600));
      return json({ ok: false, error: "Code d'accès incorrect." }, 401);
    }

    await securityStore()
      .delete(key)
      .catch(() => undefined);
    console.log("[admin-leads] connexion réussie");
    return json({ ok: true }, 200, {
      "Set-Cookie": sessionCookie(signSession(config.passcode, config.formsToken), SESSION_SECONDS),
    });
  }

  if (action === "logout" && req.method === "POST") {
    if (!isSameOriginJson(req)) return json({ ok: false, error: "Requête refusée." }, 403);
    return json({ ok: true }, 200, { "Set-Cookie": sessionCookie("", 0) });
  }

  if (action === "leads" && req.method === "GET") {
    if (!configured || !verifySession(context.cookies.get(COOKIE), config.passcode, config.formsToken)) {
      return json({ ok: false, expired: true, error: "Session expirée. Reconnectez-vous." }, 401);
    }
    try {
      const leads = await fetchLeads(context.site?.id || Netlify.env.get("SITE_ID") || "", config.formsToken);
      return json({ ok: true, leads });
    } catch (error) {
      console.error("[admin-leads] lecture des leads impossible", error instanceof Error ? error.message : error);
      return json({ ok: false, error: "Lecture des leads impossible pour le moment." }, 502);
    }
  }

  return json({ ok: false, error: "Action inconnue." }, 404);
};

export const config: Config = {
  path: "/api/admin/*",
};
