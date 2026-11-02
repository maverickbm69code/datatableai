import { AnimatePresence, motion } from "framer-motion";
import { Download, Loader2, LogOut, RefreshCw } from "lucide-react";
import { useCallback, useEffect, useState } from "react";

import { DatableWordmark } from "@/components/site/logo-mark";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  fetchAdminStatus,
  fetchLeads,
  loginAdmin,
  logoutAdmin,
  setupAdminAccess,
  type Lead,
} from "@/lib/datable-leads";
import { EASE_OUT } from "@/lib/motion";

const TOKEN_KEY = "datable-admin-token";

const SOURCE_LABELS: Record<string, string> = {
  hero: "Haut de page",
  footer: "Appel final",
};

function formatDate(value: string) {
  return new Date(value).toLocaleString("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function toCsv(leads: Lead[]) {
  const rows = [
    ["email", "source", "date"],
    ...leads.map((lead) => [lead.email, SOURCE_LABELS[lead.source] ?? lead.source, formatDate(lead.created_at)]),
  ];
  return rows.map((row) => row.map((cell) => `"${cell.replace(/"/g, '""')}"`).join(";")).join("\r\n");
}

const Admin = () => {
  const [stage, setStage] = useState<"loading" | "setup" | "login" | "leads">("loading");
  const [passcode, setPasscode] = useState("");
  const [confirm, setConfirm] = useState("");
  const [token, setToken] = useState<string | null>(null);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadLeads = useCallback(async (activeToken: string) => {
    setBusy(true);
    const result = await fetchLeads(activeToken);
    setBusy(false);

    if (!result.ok || !result.leads) {
      if (result.expired) {
        localStorage.removeItem(TOKEN_KEY);
        setToken(null);
        setStage("login");
      }
      setError(result.error ?? "Lecture des leads impossible pour le moment.");
      return;
    }

    setError(null);
    setLeads(result.leads);
    setStage("leads");
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function boot() {
      const stored = localStorage.getItem(TOKEN_KEY);
      if (stored) {
        if (cancelled) return;
        setToken(stored);
        await loadLeads(stored);
        return;
      }

      const status = await fetchAdminStatus();
      if (cancelled) return;

      if (!status.ok) {
        setError(status.error ?? "Le service est indisponible pour le moment.");
        setStage("login");
        return;
      }

      setStage(status.configured ? "login" : "setup");
    }

    void boot();
    return () => {
      cancelled = true;
    };
  }, [loadLeads]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy) return;

    if (passcode.length < 8) {
      setError("Choisissez un code d'accès de 8 caractères minimum.");
      return;
    }

    if (stage === "setup" && passcode !== confirm) {
      setError("Les deux codes d'accès ne sont pas identiques.");
      return;
    }

    setBusy(true);
    setError(null);

    const result = stage === "setup" ? await setupAdminAccess(passcode) : await loginAdmin(passcode);
    setBusy(false);

    if (!result.ok || !result.token) {
      setError(result.error ?? "Connexion impossible. Merci de réessayer.");
      return;
    }

    localStorage.setItem(TOKEN_KEY, result.token);
    setToken(result.token);
    setPasscode("");
    setConfirm("");
    await loadLeads(result.token);
  }

  async function handleLogout() {
    if (token) await logoutAdmin(token);
    localStorage.removeItem(TOKEN_KEY);
    setToken(null);
    setLeads([]);
    setPasscode("");
    setStage("login");
  }

  function handleExport() {
    const csv = `\uFEFF${toCsv(leads)}`;
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `datable-leads-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border">
        <div className="shell flex h-16 items-center justify-between">
          <DatableWordmark />
          {stage === "leads" ? (
            <Button variant="ghost" size="sm" onClick={handleLogout}>
              <LogOut className="h-4 w-4" aria-hidden="true" />
              Se déconnecter
            </Button>
          ) : null}
        </div>
      </header>

      <main className="shell py-12 md:py-16">
        <AnimatePresence mode="wait" initial={false}>
          {stage === "loading" ? (
            <motion.p
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-center gap-2 text-[15px] text-muted-foreground"
            >
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
              Chargement…
            </motion.p>
          ) : null}

          {stage === "setup" || stage === "login" ? (
            <motion.div
              key={stage}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.32, ease: EASE_OUT }}
              className="max-w-[26rem]"
            >
              <p className="eyebrow">{stage === "setup" ? "Première utilisation" : "Accès réservé"}</p>
              <h1 className="mt-4 font-display text-[clamp(1.6rem,3vw,2.15rem)] font-bold leading-tight tracking-[-0.035em] text-foreground">
                {stage === "setup" ? "Créez votre code d'accès" : "Liste des leads"}
              </h1>
              <p className="mt-4 text-[15px] leading-relaxed text-muted-foreground">
                {stage === "setup"
                  ? "Ce code protège la page d'administration et la liste des leads. Il n'est connu que de vous."
                  : "Saisissez le code d'accès de la page d'administration."}
              </p>

              <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-5" noValidate>
                <div>
                  <label
                    htmlFor="admin-passcode"
                    className="mb-2 block font-mono text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground"
                  >
                    Code d'accès
                  </label>
                  <Input
                    id="admin-passcode"
                    type="password"
                    autoComplete={stage === "setup" ? "new-password" : "current-password"}
                    value={passcode}
                    onChange={(event) => {
                      setPasscode(event.target.value);
                      if (error) setError(null);
                    }}
                    disabled={busy}
                  />
                </div>

                {stage === "setup" ? (
                  <div>
                    <label
                      htmlFor="admin-passcode-confirm"
                      className="mb-2 block font-mono text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground"
                    >
                      Confirmer le code
                    </label>
                    <Input
                      id="admin-passcode-confirm"
                      type="password"
                      autoComplete="new-password"
                      value={confirm}
                      onChange={(event) => {
                        setConfirm(event.target.value);
                        if (error) setError(null);
                      }}
                      disabled={busy}
                    />
                  </div>
                ) : null}

                <Button type="submit" size="lg" disabled={busy}>
                  {busy ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : null}
                  {stage === "setup" ? "Créer mon accès" : "Afficher les leads"}
                </Button>
              </form>

              {error ? (
                <p role="alert" className="mt-4 text-[13.5px] text-destructive">
                  {error}
                </p>
              ) : null}
            </motion.div>
          ) : null}

          {stage === "leads" ? (
            <motion.div
              key="leads"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.32, ease: EASE_OUT }}
            >
              <div className="flex flex-wrap items-end justify-between gap-4">
                <div>
                  <p className="eyebrow">Administration</p>
                  <h1 className="mt-4 font-display text-[clamp(1.6rem,3vw,2.15rem)] font-bold leading-tight tracking-[-0.035em] text-foreground">
                    Leads
                  </h1>
                  <p className="mt-3 text-[15px] text-muted-foreground">
                    {leads.length} adresse{leads.length > 1 ? "s" : ""} enregistrée{leads.length > 1 ? "s" : ""}.
                  </p>
                </div>

                <div className="flex flex-wrap gap-3">
                  <Button
                    variant="secondary"
                    onClick={() => token && loadLeads(token)}
                    disabled={busy || !token}
                  >
                    {busy ? (
                      <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                    ) : (
                      <RefreshCw className="h-4 w-4" aria-hidden="true" />
                    )}
                    Actualiser
                  </Button>
                  <Button onClick={handleExport} disabled={leads.length === 0}>
                    <Download className="h-4 w-4" aria-hidden="true" />
                    Exporter en CSV
                  </Button>
                </div>
              </div>

              {error ? (
                <p role="alert" className="mt-6 text-[13.5px] text-destructive">
                  {error}
                </p>
              ) : null}

              <div className="card-surface mt-8 overflow-hidden">
                {leads.length === 0 ? (
                  <p className="px-6 py-12 text-center text-[15px] text-muted-foreground">
                    Aucun lead pour le moment. Les adresses envoyées depuis le site apparaîtront ici.
                  </p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse text-left">
                      <caption className="sr-only">Liste des leads reçus depuis le site Datable</caption>
                      <thead>
                        <tr className="border-b border-border">
                          {["E-mail", "Source", "Date"].map((heading) => (
                            <th
                              key={heading}
                              scope="col"
                              className="px-6 py-4 font-mono text-[10.5px] font-medium uppercase tracking-[0.14em] text-muted-foreground"
                            >
                              {heading}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {leads.map((lead) => (
                          <tr key={lead.id} className="border-b border-border last:border-b-0">
                            <td className="px-6 py-4 text-[14.5px] text-foreground">{lead.email}</td>
                            <td className="px-6 py-4 text-[14.5px] text-muted-foreground">
                              {SOURCE_LABELS[lead.source] ?? lead.source}
                            </td>
                            <td className="tnum px-6 py-4 font-mono text-[13px] text-muted-foreground">
                              {formatDate(lead.created_at)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </main>
    </div>
  );
};

export default Admin;
