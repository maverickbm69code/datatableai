import { DatableWordmark } from "@/components/site/logo-mark";
import { useLang } from "@/lib/i18n";

export function SiteFooter() {
  const lang = useLang();
  const [tagline, subline] =
    lang === "fr" ? ["Chaque table compte", "Every table counts."] : ["Every table counts", "Chaque table compte."];
  return (
    <footer className="border-t border-border">
      <div className="shell flex flex-col gap-10 py-12 md:flex-row md:items-end md:justify-between">
        <div>
          <DatableWordmark />
          <p className="mt-6 font-display text-[22px] font-bold tracking-[-0.03em] text-foreground">
            {tagline}
          </p>
          <p className="mt-1.5 font-mono text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
            {subline}
          </p>
        </div>
        <div className="flex flex-col gap-4 md:items-end">
          <nav aria-label={lang === "fr" ? "Liens du pied de page" : "Footer links"}>
            <a
              href="/ressources"
              className="text-[14.5px] font-medium text-foreground underline decoration-border-strong underline-offset-4 transition-colors hover:text-primary"
            >
              {lang === "fr" ? "Ressources & Conseils" : "Resources & Insights"}
            </a>
          </nav>
          <p className="text-[13.5px] text-muted-foreground">© 2026 Datable · Paris</p>
        </div>
      </div>
    </footer>
  );
}
