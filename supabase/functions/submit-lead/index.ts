// Saves a lead from the site forms and notifies the owner.
// Deploy: supabase_deploy_edge_function -> function_name "submit-lead"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.58.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[A-Za-z]{2,}$/;

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

const sourceLabel: Record<string, string> = {
  hero: "Haut de page",
  footer: "Appel final",
};

async function sendOwnerNotification(email: string, source: string) {
  const apiKey = Deno.env.get("RESEND_API_KEY");
  const to = Deno.env.get("LEAD_NOTIFICATION_EMAIL");
  const from = Deno.env.get("LEAD_NOTIFICATION_FROM") ?? "Datable <onboarding@resend.dev>";

  if (!apiKey || !to) {
    console.log(
      "[submit-lead] notification introuvable: RESEND_API_KEY ou LEAD_NOTIFICATION_EMAIL non configuré",
    );
    return;
  }

  const receivedAt = new Date().toLocaleString("fr-FR", { timeZone: "Europe/Paris" });

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from,
        to: [to],
        subject: `Nouveau lead Datable : ${email}`,
        text: [
          "Nouveau lead reçu sur le site Datable.",
          "",
          `E-mail : ${email}`,
          `Formulaire : ${sourceLabel[source] ?? source}`,
          `Reçu le : ${receivedAt} (Paris)`,
        ].join("\n"),
      }),
    });

    if (!response.ok) {
      console.error("[submit-lead] erreur fournisseur e-mail", response.status, await response.text());
    }
  } catch (error) {
    console.error("[submit-lead] envoi de la notification impossible", error);
  }
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const body = await req.json().catch(() => ({}));
    const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
    const source = body.source === "hero" || body.source === "footer" ? body.source : null;

    if (!source) {
      console.error("[submit-lead] source invalide", body.source);
      return json({ ok: false, error: "Formulaire inconnu. Merci de recharger la page." });
    }

    if (!EMAIL_RE.test(email) || email.length > 254) {
      return json({ ok: false, error: "Merci de vérifier votre adresse e-mail." });
    }

    const url = Deno.env.get("SUPABASE_URL");
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!url || !serviceKey) {
      console.error("[submit-lead] configuration du backend manquante");
      return json({ ok: false, error: "Enregistrement impossible pour le moment. Merci de réessayer." });
    }

    const admin = createClient(url, serviceKey);
    const { error } = await admin.from("datable_leads").insert({ email, source });

    if (error) {
      // 23505 = adresse déjà enregistrée : on la considère comme un succès.
      if (error.code === "23505") {
        console.log("[submit-lead] adresse déjà connue", email);
        return json({ ok: true, alreadyKnown: true });
      }
      console.error("[submit-lead] insertion impossible", error.code, error.message);
      return json({ ok: false, error: "Enregistrement impossible pour le moment. Merci de réessayer." });
    }

    console.log("[submit-lead] lead enregistré", source, email);
    await sendOwnerNotification(email, source);

    return json({ ok: true });
  } catch (error) {
    console.error("[submit-lead] erreur inattendue", error);
    return json({ ok: false, error: "Enregistrement impossible pour le moment. Merci de réessayer." });
  }
});
