import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, Check, Loader2 } from "lucide-react";
import { useState, type FormEvent } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { submitLead, type LeadSource } from "@/lib/datable-leads";
import { useCopy, useLang } from "@/lib/i18n";
import { EASE_OUT } from "@/lib/motion";
import { selectOffer, useSelectedOffer } from "@/lib/selected-offer";
import { cn } from "@/lib/utils";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[A-Za-z]{2,}$/;

const COPY = {
  fr: {
    invalid: "Merci de vérifier votre adresse e-mail.",
    failed: "Envoi impossible pour le moment. Merci de réessayer.",
    success: "Merci ! On vous recontacte sous 48 heures.",
    chosen: "Offre choisie :",
    perMonth: "HT / mois",
    remove: "Retirer",
    label: "Votre e-mail professionnel",
    placeholder: "votre@restaurant.fr",
    sending: "Envoi…",
    submit: "Être contacté",
  },
  en: {
    invalid: "Please check your email address.",
    failed: "We couldn't send your request right now. Please try again.",
    success: "Thank you! We'll get back to you within 48 hours.",
    chosen: "Selected plan:",
    perMonth: "excl. tax / month",
    remove: "Remove",
    label: "Your work email",
    placeholder: "you@restaurant.com",
    sending: "Sending…",
    submit: "Get in touch",
  },
};

type LeadFormProps = {
  source: LeadSource;
  className?: string;
};

export function LeadForm({ source, className }: LeadFormProps) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success">("idle");
  const [error, setError] = useState<string | null>(null);

  const lang = useLang();
  const t = useCopy(COPY);
  const offer = useSelectedOffer();
  const shownOffer = source === "footer" ? offer : null;

  const inputId = `${source}-lead-email`;
  const errorId = `${source}-lead-error`;

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (status === "loading") return;

    const value = email.trim();
    if (!EMAIL_RE.test(value)) {
      setError(t.invalid);
      return;
    }

    setError(null);
    setStatus("loading");

    const result = await submitLead(value, source, shownOffer?.id, lang);
    if (!result.ok) {
      setStatus("idle");
      setError(t.failed);
      return;
    }

    setStatus("success");
  }

  return (
    <div className={cn("w-full max-w-[30rem]", className)}>
      <AnimatePresence mode="wait" initial={false}>
        {status === "success" ? (
          <motion.div
            key="success"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.32, ease: EASE_OUT }}
            className="flex items-start gap-3 rounded-md border border-border bg-card px-5 py-4 shadow-card"
            role="status"
          >
            <Check className="mt-0.5 h-5 w-5 shrink-0 text-primary" aria-hidden="true" />
            <p className="text-[15px] leading-relaxed text-foreground">
              {t.success}
            </p>
          </motion.div>
        ) : (
          <motion.form
            key="form"
            onSubmit={handleSubmit}
            initial={false}
            exit={{ opacity: 0 }}
            className="flex flex-col gap-3 sm:flex-row sm:items-start"
            noValidate
          >
            <div className="flex-1">
              {shownOffer ? (
                <p className="mb-3 flex flex-wrap items-center gap-x-2 gap-y-1 rounded-md border border-border bg-primary-soft px-3 py-2 text-[13.5px] text-foreground">
                  <span>
                    {t.chosen} <strong className="font-semibold">{shownOffer.name}</strong>, {shownOffer.price} {t.perMonth}
                  </span>
                  <button
                    type="button"
                    onClick={() => selectOffer(null)}
                    className="text-muted-foreground underline underline-offset-4 hover:text-foreground"
                  >
                    {t.remove}
                  </button>
                </p>
              ) : null}
              <label
                htmlFor={inputId}
                className="mb-2 block font-mono text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground"
              >
                {t.label}
              </label>
              <Input
                id={inputId}
                name="email"
                type="email"
                inputMode="email"
                autoComplete="email"
                placeholder={t.placeholder}
                value={email}
                onChange={(event) => {
                  setEmail(event.target.value);
                  if (error) setError(null);
                }}
                aria-invalid={error ? true : undefined}
                aria-describedby={error ? errorId : undefined}
                disabled={status === "loading"}
              />
            </div>

            <div className="sm:pt-[26px]">
              <Button type="submit" size="lg" className="w-full sm:w-auto" disabled={status === "loading"}>
                {status === "loading" ? (
                  <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                ) : null}
                {status === "loading" ? t.sending : t.submit}
                {status === "loading" ? null : <ArrowRight className="h-4 w-4" aria-hidden="true" />}
              </Button>
            </div>
          </motion.form>
        )}
      </AnimatePresence>

      {error ? (
        <p id={errorId} role="alert" className="mt-3 text-[13.5px] text-destructive">
          {error}
        </p>
      ) : null}
    </div>
  );
}
