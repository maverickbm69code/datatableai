// Data access for the « Ressources & Conseils » section.
//  * Public reads go through the Supabase REST API with the public (anon) key. Row-level
//    security only exposes PUBLISHED articles, so a draft can never be fetched from here.
//  * Admin operations go through the `admin-articles` backend function, which checks the
//    same admin session token as the existing lead list.
// Plain fetch is used (not the supabase-js query builder) so the same code runs in the
// browser and in the Node prerender script.
import { SUPABASE_PUBLISHABLE_KEY, SUPABASE_URL, supabase } from "@/integrations/supabase/client";
import type {
  AdminArticleRow,
  Article,
  ArticleDraftInput,
  ArticleSummary,
} from "@/lib/articles/types";

const SUMMARY_COLUMNS =
  "id,slug,lang,category,icon,title,excerpt,reading_minutes,published_at,modified_at,translation_of";

export type PublicResult<T> = {
  ok: boolean;
  data?: T;
  error?: string;
  /** The articles table does not exist yet (migration not applied). */
  notProvisioned?: boolean;
};

async function restGet<T>(query: string, signal?: AbortSignal): Promise<PublicResult<T>> {
  try {
    const response = await fetch(`${SUPABASE_URL}/rest/v1/datable_articles?${query}`, {
      headers: {
        apikey: SUPABASE_PUBLISHABLE_KEY,
        Authorization: `Bearer ${SUPABASE_PUBLISHABLE_KEY}`,
        Accept: "application/json",
      },
      signal,
    });

    if (!response.ok) {
      const text = await response.text().catch(() => "");
      // PGRST205 / 42P01: the table is not there yet. Not an outage: there is just nothing to show.
      const notProvisioned =
        response.status === 404 || /PGRST205|PGRST200|42P01|does not exist|Could not find the table/i.test(text);
      return { ok: false, error: `HTTP ${response.status}`, notProvisioned };
    }

    return { ok: true, data: (await response.json()) as T };
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : "network error" };
  }
}

const PUBLISHED = "status=eq.published&order=published_at.desc";

export function fetchPublishedSummaries(signal?: AbortSignal) {
  return restGet<ArticleSummary[]>(`select=${SUMMARY_COLUMNS}&${PUBLISHED}`, signal);
}

export function fetchPublishedArticles(signal?: AbortSignal) {
  return restGet<Article[]>(`select=*&${PUBLISHED}`, signal);
}

export async function fetchPublishedArticle(slug: string, signal?: AbortSignal): Promise<PublicResult<Article | null>> {
  if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(slug)) return { ok: true, data: null };
  const result = await restGet<Article[]>(`select=*&status=eq.published&slug=eq.${slug}&limit=1`, signal);
  if (!result.ok) return { ok: false, error: result.error, notProvisioned: result.notProvisioned };
  return { ok: true, data: result.data?.[0] ?? null };
}

// ---------------------------------------------------------------------------------------
// Admin (protected by the admin session token)
// ---------------------------------------------------------------------------------------

export type RebuildStatus = "triggered" | "not_configured" | "failed" | "not_needed";

type AdminResponse<T> = {
  ok: boolean;
  error?: string;
  expired?: boolean;
  rebuild?: RebuildStatus;
} & T;

async function adminCall<T>(action: string, token: string, payload: Record<string, unknown> = {}) {
  const { data, error } = await supabase.functions.invoke("admin-articles", {
    body: { action, token, ...payload },
    headers: { "Content-Type": "application/json" },
  });
  if (error || !data) {
    return { ok: false, error: "Le service est indisponible pour le moment." } as AdminResponse<T>;
  }
  return data as AdminResponse<T>;
}

export const adminListArticles = (token: string) =>
  adminCall<{ articles?: AdminArticleRow[] }>("list", token);

export const adminGetArticle = (token: string, id: string) =>
  adminCall<{ article?: Article }>("get", token, { id });

export const adminSaveArticle = (token: string, article: ArticleDraftInput) =>
  adminCall<{ article?: Article }>("save", token, { article });

export const adminPublishArticle = (token: string, id: string) =>
  adminCall<{ article?: Article }>("publish", token, { id });

export const adminUnpublishArticle = (token: string, id: string) =>
  adminCall<{ article?: Article }>("unpublish", token, { id });

export const adminDeleteArticle = (token: string, id: string) =>
  adminCall<Record<string, never>>("delete", token, { id });
