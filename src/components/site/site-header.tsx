import { AnimatePresence, motion } from "framer-motion";
import { Menu, X } from "lucide-react";
import { useEffect, useState } from "react";

import { DatableWordmark } from "@/components/site/logo-mark";
import { ReadingProgress } from "@/components/site/reading-progress";
import { Button } from "@/components/ui/button";
import { EASE_OUT } from "@/lib/motion";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { href: "#fonctionnement", label: "Fonctionnement" },
  { href: "#offres", label: "Nos offres" },
  { href: "#confidentialite", label: "Confidentialité" },
];

export function SiteHeader() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  return (
    <header
      className={cn(
        "sticky top-0 z-50 border-b transition-[background-color,border-color,box-shadow] duration-300",
        scrolled
          ? "border-border bg-background/85 shadow-card backdrop-blur-xl"
          : "border-transparent bg-background/60 backdrop-blur-sm",
      )}
    >
      <div
        className={cn(
          "shell flex items-center justify-between transition-[height] duration-300",
          scrolled ? "h-14" : "h-16",
        )}
      >
        <a href="#hero" className="rounded-sm" aria-label="Datable, retour en haut de page">
          <DatableWordmark />
        </a>

        <nav aria-label="Navigation principale" className="hidden items-center gap-1 lg:flex">
          {NAV_ITEMS.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="rounded-sm px-3 py-2 text-[14px] font-medium text-muted-foreground transition-colors duration-200 hover:text-foreground"
            >
              {item.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <Button asChild size="sm" className="hidden sm:inline-flex">
            <a href="#diagnostic">Mon diagnostic offert</a>
          </Button>
          <button
            type="button"
            onClick={() => setMenuOpen((open) => !open)}
            aria-expanded={menuOpen}
            aria-label={menuOpen ? "Fermer le menu" : "Ouvrir le menu"}
            className="inline-flex h-11 w-11 items-center justify-center rounded-sm text-foreground transition-colors hover:bg-primary-soft lg:hidden"
          >
            {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      <ReadingProgress />

      <AnimatePresence>
        {menuOpen ? (
          <motion.div
            key="mobile-nav"
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.24, ease: EASE_OUT }}
            className="absolute inset-x-0 top-full border-b border-border bg-background px-5 pb-6 pt-2 shadow-card lg:hidden"
          >
            <nav aria-label="Navigation mobile" className="flex flex-col">
              {NAV_ITEMS.map((item) => (
                <a
                  key={item.href}
                  href={item.href}
                  onClick={() => setMenuOpen(false)}
                  className="border-b border-border py-4 font-display text-lg font-semibold tracking-[-0.02em] text-foreground"
                >
                  {item.label}
                </a>
              ))}
            </nav>
            <Button asChild size="lg" className="mt-6 w-full">
              <a href="#diagnostic" onClick={() => setMenuOpen(false)}>
                Mon diagnostic offert
              </a>
            </Button>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </header>
  );
}
