import { supabase } from "@/integrations/supabase/client";
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

type AdminStatusResult = { ok: boolean; configured?: boolean; error?: string };
type AdminAuthResult = { ok: boolean; token?: string; needsSetup?: boolean; error?: string };
type AdminListResult = { ok: boolean; leads?: Lead[]; expired?: boolean; error?: string };

export async function fetchAdminStatus() {
  const { data, error } = await supabase.functions.invoke("admin-leads", {
    body: { action: "status" },
    headers: { "Content-Type": "application/json" },
  });
  if (error) return { ok: false, error: "Le service est indisponible pour le moment." } as AdminStatusResult;
  return (data as AdminStatusResult) ?? { ok: false, error: "Le service est indisponible pour le moment." };
}

async function adminAuth(action: "setup" | "login", passcode: string) {
  const { data, error } = await supabase.functions.invoke("admin-leads", {
    body: { action, passcode },
    headers: { "Content-Type": "application/json" },
  });
  if (error) return { ok: false, error: "Le service est indisponible pour le moment." } as AdminAuthResult;
  return (data as AdminAuthResult) ?? { ok: false, error: "Le service est indisponible pour le moment." };
}

export const setupAdminAccess = (passcode: string) => adminAuth("setup", passcode);
export const loginAdmin = (passcode: string) => adminAuth("login", passcode);

export async function fetchLeads(token: string) {
  const { data, error } = await supabase.functions.invoke("admin-leads", {
    body: { action: "list", token },
    headers: { "Content-Type": "application/json" },
  });
  if (error) return { ok: false, error: "Le service est indisponible pour le moment." } as AdminListResult;
  return (data as AdminListResult) ?? { ok: false, error: "Le service est indisponible pour le moment." };
}

export async function logoutAdmin(token: string) {
  await supabase.functions.invoke("admin-leads", {
    body: { action: "logout", token },
    headers: { "Content-Type": "application/json" },
  });
}
