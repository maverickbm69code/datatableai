import { DatableWordmark } from "@/components/site/logo-mark";

export function SiteFooter() {
  return (
    <footer className="border-t border-border">
      <div className="shell flex flex-col gap-10 py-12 md:flex-row md:items-end md:justify-between">
        <div>
          <DatableWordmark />
          <p className="mt-6 font-display text-[22px] font-bold tracking-[-0.03em] text-foreground">
            Chaque table compte
          </p>
          <p className="mt-1.5 font-mono text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
            Every table counts.
          </p>
        </div>
        <p className="text-[13.5px] text-muted-foreground">© 2026 Datable · Paris</p>
      </div>
    </footer>
  );
}
