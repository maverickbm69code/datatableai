import type { Lang } from "@/lib/i18n";

export type LeadSource = "hero" | "footer";

export type Lead = {
  id: string;
  email: string;
  source: string;
  created_at: string;
};

type SubmitLeadResult = { ok: boolean; error?: string };

const SOURCE_LABELS: Record<LeadSource, string> = {
  hero: "Haut de page",
  footer: "Appel final",
};

// Internal labels for the lead notification (read by the team, in French).
// Same amounts in both languages; the symbol matches what the visitor saw (€ or $).
const OFFERS: Record<string, { name: string; price: number }> = {
  "coffee-shop": { name: "Coffee Shop", price: 199 },
  restaurant: { name: "Restaurant", price: 299 },
  brasserie: { name: "Brasserie", price: 449 },
  gastronomique: { name: "Gastronomique & Étoilé", price: 699 },
};

function offerLabel(id: string, lang: Lang) {
  const offer = OFFERS[id];
  if (!offer) return id;
  return lang === "en"
    ? `${offer.name} ($${offer.price}/mois, site anglais)`
    : `${offer.name} (${offer.price} € HT/mois)`;
}

// Leads go to Netlify Forms (form "lead", declared in public/__forms.html).
export async function submitLead(
  email: string,
  source: LeadSource,
  offer?: string,
  lang: Lang = "fr",
): Promise<SubmitLeadResult> {
  const body = new URLSearchParams({
    "form-name": "lead",
    subject: `Nouveau lead Datable : ${email}`,
    source: SOURCE_LABELS[source],
    offer: offer ? offerLabel(offer, lang) : "",
    email,
    language: lang === "en" ? "Anglais" : "Français",
    "bot-field": "",
  });

  try {
    const response = await fetch("/__forms.html", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: body.toString(),
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return { ok: true };
  } catch (error) {
    console.error("envoi du lead impossible", error);
    return { ok: false, error: "Envoi impossible pour le moment. Merci de réessayer." };
  }
}

// Admin API (Netlify Function netlify/functions/admin-leads.mts). The session lives in an
// HttpOnly cookie set by the server: no token or secret is ever handled by page scripts.
type AdminStatusResult = { ok: boolean; configured?: boolean; authenticated?: boolean; error?: string };
type AdminAuthResult = { ok: boolean; error?: string };
type AdminListResult = { ok: boolean; leads?: Lead[]; expired?: boolean; error?: string };

const UNAVAILABLE = "Le service est indisponible pour le moment.";

async function adminRequest<T extends { ok: boolean; error?: string }>(path: string, body?: unknown): Promise<T> {
  try {
    const response = await fetch(`/api/admin/${path}`, {
      method: body === undefined ? "GET" : "POST",
      credentials: "same-origin",
      cache: "no-store",
      headers: body === undefined ? undefined : { "Content-Type": "application/json" },
      body: body === undefined ? undefined : JSON.stringify(body),
    });
    const data = (await response.json().catch(() => null)) as T | null;
    return data ?? ({ ok: false, error: UNAVAILABLE } as T);
  } catch {
    return { ok: false, error: UNAVAILABLE } as T;
  }
}

export const fetchAdminStatus = () => adminRequest<AdminStatusResult>("status");
export const loginAdmin = (passcode: string) => adminRequest<AdminAuthResult>("login", { passcode });
export const fetchLeads = () => adminRequest<AdminListResult>("leads");
export async function logoutAdmin() {
  await adminRequest("logout", {});
}
