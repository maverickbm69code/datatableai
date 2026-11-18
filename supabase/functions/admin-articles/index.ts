// Admin access for the Datable articles (section « Ressources & Conseils »).
// Same protection as `admin-leads`: the caller must send the admin session token created by
// that function (table datable_admin_sessions). Nothing here reads or changes the passcode,
// the sessions or the leads. The browser never writes to the articles table directly.
// Deploy: supabase_deploy_edge_function -> function_name "admin-articles"
//
// Optional secret: NETLIFY_BUILD_HOOK_URL (https://api.netlify.com/build_hooks/...). When set,
// publishing, unpublishing, deleting or editing a PUBLISHED article triggers a new site build,
// which regenerates the prerendered article pages and sitemap.xml.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.58.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

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

type Admin = ReturnType<typeof createClient>;

// Identical to the check in admin-leads: a token is valid while its hash is stored and not expired.
async function readSession(admin: Admin, token: string) {
  if (!token) return false;

  const { data, error } = await admin
    .from("datable_admin_sessions")
    .select("expires_at")
    .eq("token_hash", await sha256(token))
    .maybeSingle();

  if (error) {
    console.error("[admin-articles] lecture de session impossible", error.code, error.message);
    return false;
  }

  if (!data) return false;
  return new Date(data.expires_at as string).getTime() > Date.now();
}

// ---------------------------------------------------------------------------------------
// Validation (mirrors src/lib/articles/categories.ts)
// ---------------------------------------------------------------------------------------

const CATEGORIES = ["rentabilite", "pilotage", "data-ia", "menu-engineering", "cas-clients", "conseils"];
const ICONS = [
  "trending-up", "coins", "receipt", "gauge", "target", "bar-chart", "line-chart", "pie-chart",
  "brain-circuit", "sparkles", "utensils-crossed", "chef-hat", "handshake", "lightbulb", "book-open",
];
const SLUG_RE = /^[a-z0-9]+(-[a-z0-9]+)*$/;

class ValidationError extends Error {}

const MAX_JSON_CHARS = 400_000;
const MAX_NODES = 8000;
const MAX_DEPTH = 12;
const CALLOUT_VARIANTS = ["conseil", "attention", "info"];

type Mark = { type: string; attrs?: Record<string, unknown> };
type Node = {
  type: string;
  attrs?: Record<string, unknown>;
  content?: Node[];
  marks?: Mark[];
  text?: string;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function safeHref(value: unknown) {
  if (typeof value !== "string") return null;
  const href = value.trim();
  if (href.length === 0 || href.length > 2000) return null;
  if (/^(https?:\/\/|mailto:|tel:)/i.test(href)) return href;
  if (/^\/(?!\/)/.test(href) || href.startsWith("#")) return href;
  return null;
}

function cleanMarks(marks: unknown): Mark[] | undefined {
  if (marks === undefined) return undefined;
  if (!Array.isArray(marks)) throw new ValidationError("Format de contenu invalide (marques).");
  const out: Mark[] = [];
  for (const mark of marks) {
    if (!isRecord(mark) || typeof mark.type !== "string") throw new ValidationError("Format de contenu invalide (marque).");
    if (["bold", "italic", "strike", "code", "underline"].includes(mark.type)) {
      out.push({ type: mark.type });
    } else if (mark.type === "link") {
      const attrs = isRecord(mark.attrs) ? mark.attrs : {};
      const href = safeHref(attrs.href);
      if (!href) throw new ValidationError("Un lien du contenu est invalide (http, https, mailto, tel ou chemin du site).");
      out.push({ type: "link", attrs: { href } });
    } else {
      throw new ValidationError(`Mise en forme non prise en charge : ${mark.type}.`);
    }
  }
  return out.length ? out : undefined;
}

function intIn(value: unknown, min: number, max: number, fallback: number) {
  const n = typeof value === "number" ? Math.trunc(value) : NaN;
  return Number.isFinite(n) && n >= min && n <= max ? n : fallback;
}

function cleanNode(raw: unknown, depth: number, counter: { n: number }): Node {
  if (!isRecord(raw) || typeof raw.type !== "string") throw new ValidationError("Format de contenu invalide.");
  if (depth > MAX_DEPTH) throw new ValidationError("Contenu trop imbriqué.");
  if (++counter.n > MAX_NODES) throw new ValidationError("Contenu trop long.");

  const type = raw.type;
  const attrs = isRecord(raw.attrs) ? raw.attrs : {};
  const children = (): Node[] | undefined => {
    if (raw.content === undefined) return undefined;
    if (!Array.isArray(raw.content)) throw new ValidationError("Format de contenu invalide (enfants).");
    return raw.content.map((child) => cleanNode(child, depth + 1, counter));
  };

  switch (type) {
    case "text": {
      if (typeof raw.text !== "string" || raw.text.length === 0 || raw.text.length > 20000) {
        throw new ValidationError("Texte invalide dans le contenu.");
      }
      const marks = cleanMarks(raw.marks);
      return marks ? { type, text: raw.text, marks } : { type, text: raw.text };
    }
    case "paragraph":
    case "bulletList":
    case "orderedList":
    case "listItem":
    case "blockquote":
    case "table":
    case "tableRow":
    case "keyFigures":
    case "keyFigure": {
      const content = children();
      return content ? { type, content } : { type };
    }
    case "heading": {
      const level = intIn(attrs.level, 2, 3, 0);
      if (level === 0) throw new ValidationError("Seuls les titres de niveau 2 et 3 sont autorisés (le titre principal est le titre de l'article).");
      const content = children();
      return content ? { type, attrs: { level }, content } : { type, attrs: { level } };
    }
    case "horizontalRule":
    case "hardBreak":
      return { type };
    case "tableCell":
    case "tableHeader": {
      const content = children();
      const cleaned = {
        colspan: intIn(attrs.colspan, 1, 20, 1),
        rowspan: intIn(attrs.rowspan, 1, 20, 1),
      };
      return content ? { type, attrs: cleaned, content } : { type, attrs: cleaned };
    }
    case "callout": {
      const variant = typeof attrs.variant === "string" && CALLOUT_VARIANTS.includes(attrs.variant) ? attrs.variant : "conseil";
      const content = children();
      return content ? { type, attrs: { variant }, content } : { type, attrs: { variant } };
    }
    case "barChart": {
      const title = typeof attrs.title === "string" ? attrs.title.slice(0, 120) : "";
      const unit = typeof attrs.unit === "string" ? attrs.unit.slice(0, 12) : "";
      const rows = Array.isArray(attrs.data) ? attrs.data : [];
      if (rows.length === 0 || rows.length > 12) throw new ValidationError("Un graphique doit contenir entre 1 et 12 lignes.");
      const data = rows.map((row) => {
        if (!isRecord(row) || typeof row.label !== "string" || typeof row.value !== "number" || !Number.isFinite(row.value)) {
          throw new ValidationError("Une ligne de graphique est invalide (libellé et valeur numérique attendus).");
        }
        return { label: row.label.slice(0, 60), value: row.value };
      });
      return { type, attrs: { title, unit, data } };
    }
    default:
      throw new ValidationError(`Bloc non pris en charge dans le contenu : ${type}.`);
  }
}

function cleanDocument(raw: unknown) {
  if (!isRecord(raw) || raw.type !== "doc") throw new ValidationError("Format de contenu invalide.");
  if (JSON.stringify(raw).length > MAX_JSON_CHARS) throw new ValidationError("Le contenu est trop volumineux.");
  const counter = { n: 0 };
  const content = Array.isArray(raw.content) ? raw.content.map((node) => cleanNode(node, 1, counter)) : [];
  return { type: "doc", content } as { type: "doc"; content: Node[] };
}

const BLOCKS = new Set(["paragraph", "heading", "listItem", "tableCell", "tableHeader", "keyFigure", "blockquote"]);

function nodeText(node: Node): string {
  if (node.type === "text") return node.text ?? "";
  if (node.type === "hardBreak") return " ";
  if (node.type === "barChart") {
    const data = (node.attrs?.data ?? []) as { label: string; value: number }[];
    return [String(node.attrs?.title ?? ""), ...data.map((row) => `${row.label} ${row.value}`)].join(" ");
  }
  const inner = (node.content ?? []).map(nodeText).join(BLOCKS.has(node.type) ? "" : " ");
  return BLOCKS.has(node.type) ? `${inner} ` : inner;
}

function readingMinutes(doc: { content: Node[] }) {
  const text = doc.content.map(nodeText).join(" ").replace(/\s+/g, " ").trim();
  const words = text.match(/[\p{L}\p{N}][\p{L}\p{N}'’-]*/gu)?.length ?? 0;
  return Math.max(1, Math.ceil(words / 200));
}

function hasBody(doc: { content: Node[] }) {
  return doc.content.some((node) => nodeText(node).trim().length > 0 || node.type === "table" || node.type === "barChart");
}

function str(value: unknown, min: number, max: number, label: string) {
  const text = typeof value === "string" ? value.trim() : "";
  if (text.length < min) throw new ValidationError(`${label} : ${min === 1 ? "champ obligatoire" : `${min} caractères minimum`}.`);
  if (text.length > max) throw new ValidationError(`${label} : ${max} caractères maximum.`);
  return text;
}

function optStr(value: unknown, max: number, label: string) {
  if (value === null || value === undefined || value === "") return null;
  return str(value, 1, max, label);
}

const COLUMNS = "*";

// ---------------------------------------------------------------------------------------
// Site rebuild (refreshes the prerendered pages and the sitemap)
// ---------------------------------------------------------------------------------------

type Rebuild = "triggered" | "not_configured" | "failed" | "not_needed";

async function triggerRebuild(): Promise<Rebuild> {
  const hook = Deno.env.get("NETLIFY_BUILD_HOOK_URL");
  if (!hook) return "not_configured";
  try {
    const url = new URL(hook);
    if (url.protocol !== "https:" || url.hostname !== "api.netlify.com" || !url.pathname.startsWith("/build_hooks/")) {
      console.error("[admin-articles] NETLIFY_BUILD_HOOK_URL invalide");
      return "failed";
    }
    const response = await fetch(url.toString(), { method: "POST" });
    if (!response.ok) {
      console.error("[admin-articles] déclenchement du build refusé", response.status);
      return "failed";
    }
    return "triggered";
  } catch (error) {
    console.error("[admin-articles] déclenchement du build impossible", error);
    return "failed";
  }
}

// ---------------------------------------------------------------------------------------

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  const url = Deno.env.get("SUPABASE_URL");
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

  if (!url || !serviceKey) {
    console.error("[admin-articles] configuration du backend manquante");
    return json({ ok: false, error: "Le service est indisponible pour le moment." });
  }

  const admin = createClient(url, serviceKey);
  const body = await req.json().catch(() => ({}));
  const action = typeof body.action === "string" ? body.action : "";
  const token = typeof body.token === "string" ? body.token : "";

  // Every action requires a valid admin session.
  if (!(await readSession(admin, token))) {
    return json({ ok: false, expired: true, error: "Session expirée. Reconnectez-vous." });
  }

  const table = () => admin.from("datable_articles");
  const unavailable = (where: string, error: { code?: string; message?: string }) => {
    console.error(`[admin-articles] ${where}`, error.code, error.message);
    return json({ ok: false, error: "Opération impossible pour le moment. Merci de réessayer." });
  };

  try {
    if (action === "list") {
      const { data, error } = await table()
        .select("id, slug, lang, category, title, status, published_at, updated_at, reading_minutes, translation_of")
        .order("updated_at", { ascending: false })
        .limit(500);
      if (error) return unavailable("liste impossible", error);
      return json({ ok: true, articles: data ?? [] });
    }

    if (action === "get") {
      const id = typeof body.id === "string" ? body.id : "";
      const { data, error } = await table().select(COLUMNS).eq("id", id).maybeSingle();
      if (error) return unavailable("lecture impossible", error);
      if (!data) return json({ ok: false, error: "Article introuvable." });
      return json({ ok: true, article: data });
    }

    if (action === "save") {
      const input = isRecord(body.article) ? body.article : {};

      const slug = str(input.slug, 3, 120, "URL");
      if (!SLUG_RE.test(slug)) {
        throw new ValidationError("URL : lettres minuscules, chiffres et tirets uniquement (ex. indicateurs-rentabilite-restaurant).");
      }
      const lang = input.lang === "en" ? "en" : input.lang === "fr" ? "fr" : null;
      if (!lang) throw new ValidationError("Langue invalide.");
      const category = typeof input.category === "string" && CATEGORIES.includes(input.category) ? input.category : null;
      if (!category) throw new ValidationError("Choisissez une catégorie.");
      const icon = typeof input.icon === "string" && ICONS.includes(input.icon) ? input.icon : null;

      const doc = cleanDocument(input.content);
      const record = {
        slug,
        lang,
        category,
        icon,
        title: str(input.title, 3, 160, "Titre"),
        excerpt: optStr(input.excerpt, 320, "Description courte") ?? "",
        seo_title: optStr(input.seo_title, 120, "Titre SEO"),
        seo_description: optStr(input.seo_description, 200, "Description SEO"),
        author_name: str(input.author_name, 2, 80, "Auteur"),
        author_role: optStr(input.author_role, 120, "Fonction de l'auteur"),
        content: doc,
        reading_minutes: readingMinutes(doc),
        translation_of: null as string | null,
        updated_at: new Date().toISOString(),
      };

      const id = typeof input.id === "string" && input.id ? input.id : null;

      let existing: { id: string; status: string; published_at: string | null } | null = null;
      if (id) {
        const { data, error } = await table().select("id, status, published_at").eq("id", id).maybeSingle();
        if (error) return unavailable("lecture impossible", error);
        if (!data) return json({ ok: false, error: "Article introuvable." });
        existing = data as typeof existing;
      }

      if (typeof input.translation_of === "string" && input.translation_of) {
        if (input.translation_of === id) throw new ValidationError("Un article ne peut pas être sa propre traduction.");
        const { data, error } = await table().select("id, lang").eq("id", input.translation_of).maybeSingle();
        if (error) return unavailable("vérification de la traduction impossible", error);
        if (!data) throw new ValidationError("L'article d'origine de la traduction est introuvable.");
        if ((data as { lang: string }).lang === lang) {
          throw new ValidationError("Une traduction doit être dans l'autre langue que l'article d'origine.");
        }
        record.translation_of = input.translation_of;
      }

      const published = existing?.status === "published";
      const extra: Record<string, unknown> = {};
      if (published && input.mark_modified === true) extra.modified_at = new Date().toISOString();

      const result = existing
        ? await table().update({ ...record, ...extra }).eq("id", existing.id).select(COLUMNS).single()
        : await table().insert({ ...record, status: "draft" }).select(COLUMNS).single();

      if (result.error) {
        if (result.error.code === "23505") {
          const message = /translation_of/.test(result.error.message ?? "")
            ? "Cet article a déjà une traduction associée."
            : "Cette URL est déjà utilisée par un autre article.";
          return json({ ok: false, error: message });
        }
        return unavailable("enregistrement impossible", result.error);
      }

      const rebuild: Rebuild = published ? await triggerRebuild() : "not_needed";
      return json({ ok: true, article: result.data, rebuild });
    }

    if (action === "publish") {
      const id = typeof body.id === "string" ? body.id : "";
      const { data, error } = await table().select(COLUMNS).eq("id", id).maybeSingle();
      if (error) return unavailable("lecture impossible", error);
      if (!data) return json({ ok: false, error: "Article introuvable." });

      const article = data as { content: { content: Node[] }; excerpt: string; published_at: string | null; title: string };
      if (!hasBody(article.content ?? { content: [] })) {
        return json({ ok: false, error: "Ajoutez du contenu avant de publier cet article." });
      }
      if (!article.excerpt || article.excerpt.trim().length < 20) {
        return json({ ok: false, error: "Ajoutez une description courte (20 caractères minimum) avant de publier." });
      }

      const now = new Date().toISOString();
      const { data: updated, error: updateError } = await table()
        .update({ status: "published", published_at: article.published_at ?? now, updated_at: now })
        .eq("id", id)
        .select(COLUMNS)
        .single();
      if (updateError) return unavailable("publication impossible", updateError);

      return json({ ok: true, article: updated, rebuild: await triggerRebuild() });
    }

    if (action === "unpublish") {
      const id = typeof body.id === "string" ? body.id : "";
      const { data, error } = await table()
        .update({ status: "draft", updated_at: new Date().toISOString() })
        .eq("id", id)
        .select(COLUMNS)
        .maybeSingle();
      if (error) return unavailable("dépublication impossible", error);
      if (!data) return json({ ok: false, error: "Article introuvable." });
      return json({ ok: true, article: data, rebuild: await triggerRebuild() });
    }

    if (action === "delete") {
      const id = typeof body.id === "string" ? body.id : "";
      const { data: before, error: readError } = await table().select("status").eq("id", id).maybeSingle();
      if (readError) return unavailable("lecture impossible", readError);
      if (!before) return json({ ok: false, error: "Article introuvable." });

      const { error } = await table().delete().eq("id", id);
      if (error) return unavailable("suppression impossible", error);

      const rebuild: Rebuild = (before as { status: string }).status === "published" ? await triggerRebuild() : "not_needed";
      return json({ ok: true, rebuild });
    }

    return json({ ok: false, error: "Action inconnue." });
  } catch (error) {
    if (error instanceof ValidationError) return json({ ok: false, error: error.message });
    console.error("[admin-articles] erreur inattendue", error);
    return json({ ok: false, error: "Opération impossible pour le moment. Merci de réessayer." });
  }
});
