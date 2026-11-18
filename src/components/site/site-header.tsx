import { AnimatePresence, motion } from "framer-motion";
import { Menu, X } from "lucide-react";
import { useEffect, useState, type ReactNode } from "react";

import { LanguageSwitcher } from "@/components/site/language-switcher";
import { DatableWordmark } from "@/components/site/logo-mark";
import { ReadingProgress } from "@/components/site/reading-progress";
import { Button } from "@/components/ui/button";
import { useCopy } from "@/lib/i18n";
import { EASE_OUT } from "@/lib/motion";
import { cn } from "@/lib/utils";

const COPY = {
  fr: {
    nav: [
      { href: "#fonctionnement", label: "Fonctionnement" },
      { href: "#offres", label: "Nos offres" },
      { href: "#confidentialite", label: "Confidentialité" },
    ],
    resources: "Ressources & Conseils",
    home: "Datable, retour en haut de page",
    homeFromPage: "Datable, retour à l'accueil",
    mainNav: "Navigation principale",
    mobileNav: "Navigation mobile",
    cta: "Mon diagnostic offert",
    openMenu: "Ouvrir le menu",
    closeMenu: "Fermer le menu",
  },
  en: {
    nav: [
      { href: "#fonctionnement", label: "How it works" },
      { href: "#offres", label: "Pricing" },
      { href: "#confidentialite", label: "Privacy" },
    ],
    resources: "Resources & Insights",
    home: "Datable, back to top",
    homeFromPage: "Datable, back to the home page",
    mainNav: "Main navigation",
    mobileNav: "Mobile navigation",
    cta: "Get my free assessment",
    openMenu: "Open menu",
    closeMenu: "Close menu",
  },
};

type SiteHeaderProps = {
  /** false on the « Ressources & Conseils » pages: anchors then point back to the home page. */
  onHome?: boolean;
  /** Replaces the FR / EN switcher (articles only offer the languages they exist in). */
  languageSlot?: ReactNode;
};

export function SiteHeader({ onHome = true, languageSlot }: SiteHeaderProps = {}) {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const t = useCopy(COPY);
  const prefix = onHome ? "" : "/";
  const items = [
    ...t.nav.map((item) => ({ ...item, href: `${prefix}${item.href}`, current: false })),
    { href: "/ressources", label: t.resources, current: !onHome },
  ];

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
        <a href={onHome ? "#hero" : "/"} className="rounded-sm" aria-label={onHome ? t.home : t.homeFromPage}>
          <DatableWordmark />
        </a>

        <nav aria-label={t.mainNav} className="hidden items-center gap-1 lg:flex">
          {items.map((item) => (
            <a
              key={item.href}
              href={item.href}
              aria-current={item.current ? "page" : undefined}
              className={cn(
                "rounded-sm px-3 py-2 text-[14px] font-medium text-muted-foreground transition-colors duration-200 hover:text-foreground",
                item.current && "text-foreground",
              )}
            >
              {item.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          {languageSlot ?? <LanguageSwitcher />}
          <Button asChild size="sm" className="hidden sm:inline-flex">
            <a href={`${prefix}#diagnostic`}>{t.cta}</a>
          </Button>
          <button
            type="button"
            onClick={() => setMenuOpen((open) => !open)}
            aria-expanded={menuOpen}
            aria-label={menuOpen ? t.closeMenu : t.openMenu}
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
            <nav aria-label={t.mobileNav} className="flex flex-col">
              {items.map((item) => (
                <a
                  key={item.href}
                  href={item.href}
                  aria-current={item.current ? "page" : undefined}
                  onClick={() => setMenuOpen(false)}
                  className="border-b border-border py-4 font-display text-lg font-semibold tracking-[-0.02em] text-foreground"
                >
                  {item.label}
                </a>
              ))}
            </nav>
            <Button asChild size="lg" className="mt-6 w-full">
              <a href={`${prefix}#diagnostic`} onClick={() => setMenuOpen(false)}>
                {t.cta}
              </a>
            </Button>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </header>
  );
}
