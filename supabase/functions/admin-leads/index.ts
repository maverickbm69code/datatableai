// Admin access for the Datable lead list (protected page /admin).
// The passcode and the sessions live server-side only: the browser never reads the tables.
// Deploy: supabase_deploy_edge_function -> function_name "admin-leads"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.58.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SESSION_HOURS = 12;

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

const hex = (bytes: Uint8Array) =>
  Array.from(bytes).map((byte) => byte.toString(16).padStart(2, "0")).join("");

async function sha256(value: string) {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value));
  return hex(new Uint8Array(digest));
}

function randomToken() {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  return hex(bytes);
}

type Admin = ReturnType<typeof createClient>;

async function createSession(admin: Admin) {
  const token = randomToken();
  const expiresAt = new Date(Date.now() + SESSION_HOURS * 3600 * 1000).toISOString();

  await admin.from("datable_admin_sessions").delete().lt("expires_at", new Date().toISOString());

  const { error } = await admin
    .from("datable_admin_sessions")
    .insert({ token_hash: await sha256(token), expires_at: expiresAt });

  if (error) {
    console.error("[admin-leads] création de session impossible", error.code, error.message);
    return null;
  }

  return token;
}

async function readSession(admin: Admin, token: string) {
  if (!token) return false;

  const { data, error } = await admin
    .from("datable_admin_sessions")
    .select("expires_at")
    .eq("token_hash", await sha256(token))
    .maybeSingle();

  if (error) {
    console.error("[admin-leads] lecture de session impossible", error.code, error.message);
    return false;
  }

  if (!data) return false;
  return new Date(data.expires_at as string).getTime() > Date.now();
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  const url = Deno.env.get("SUPABASE_URL");
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

  if (!url || !serviceKey) {
    console.error("[admin-leads] configuration du backend manquante");
    return json({ ok: false, error: "Le service est indisponible pour le moment." });
  }

  const admin = createClient(url, serviceKey);
  const body = await req.json().catch(() => ({}));
  const action = typeof body.action === "string" ? body.action : "";
  const passcode = typeof body.passcode === "string" ? body.passcode : "";
  const token = typeof body.token === "string" ? body.token : "";

  if (action === "status") {
    const { count, error } = await admin
      .from("datable_admin_access")
      .select("id", { count: "exact", head: true });

    if (error) {
      console.error("[admin-leads] statut indisponible", error.code, error.message);
      return json({ ok: false, error: "Le service est indisponible pour le moment." });
    }

    return json({ ok: true, configured: (count ?? 0) > 0 });
  }

  if (action === "setup") {
    if (passcode.length < 8) {
      return json({ ok: false, error: "Choisissez un code d'accès de 8 caractères minimum." });
    }

    const { count, error: countError } = await admin
      .from("datable_admin_access")
      .select("id", { count: "exact", head: true });

    if (countError) {
      console.error("[admin-leads] vérification impossible", countError.code, countError.message);
      return json({ ok: false, error: "Le service est indisponible pour le moment." });
    }

    if ((count ?? 0) > 0) {
      return json({ ok: false, error: "Un accès existe déjà. Saisissez votre code d'accès." });
    }

    const salt = randomToken();
    const { error } = await admin
      .from("datable_admin_access")
      .insert({ passcode_salt: salt, passcode_hash: await sha256(salt + passcode) });

    if (error) {
      console.error("[admin-leads] création de l'accès impossible", error.code, error.message);
      return json({ ok: false, error: "Création de l'accès impossible. Merci de réessayer." });
    }

    const newToken = await createSession(admin);
    if (!newToken) return json({ ok: false, error: "Connexion impossible. Merci de réessayer." });

    console.log("[admin-leads] accès administrateur créé");
    return json({ ok: true, token: newToken });
  }

  if (action === "login") {
    const { data, error } = await admin
      .from("datable_admin_access")
      .select("passcode_salt, passcode_hash")
      .maybeSingle();

    if (error) {
      console.error("[admin-leads] lecture de l'accès impossible", error.code, error.message);
      return json({ ok: false, error: "Le service est indisponible pour le moment." });
    }

    if (!data) {
      return json({ ok: false, needsSetup: true, error: "Aucun accès n'est encore configuré." });
    }

    const candidate = await sha256(`${data.passcode_salt}${passcode}`);
    if (candidate !== data.passcode_hash) {
      console.log("[admin-leads] code d'accès refusé");
      return json({ ok: false, error: "Code d'accès incorrect." });
    }

    const newToken = await createSession(admin);
    if (!newToken) return json({ ok: false, error: "Connexion impossible. Merci de réessayer." });

    console.log("[admin-leads] connexion réussie");
    return json({ ok: true, token: newToken });
  }

  if (action === "logout") {
    if (token) {
      await admin.from("datable_admin_sessions").delete().eq("token_hash", await sha256(token));
    }
    return json({ ok: true });
  }

  if (action === "list") {
    if (!(await readSession(admin, token))) {
      return json({ ok: false, expired: true, error: "Session expirée. Reconnectez-vous." });
    }

    const { data, error } = await admin
      .from("datable_leads")
      .select("id, email, source, created_at")
      .order("created_at", { ascending: false })
      .limit(2000);

    if (error) {
      console.error("[admin-leads] lecture des leads impossible", error.code, error.message);
      return json({ ok: false, error: "Lecture des leads impossible pour le moment." });
    }

    return json({ ok: true, leads: data ?? [] });
  }

  return json({ ok: false, error: "Action inconnue." });
});
