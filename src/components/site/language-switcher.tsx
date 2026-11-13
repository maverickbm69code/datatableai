import { setLang, useLang, type Lang } from "@/lib/i18n";
import { cn } from "@/lib/utils";

const OPTIONS: { value: Lang; label: string; name: string }[] = [
  { value: "fr", label: "FR", name: "Français" },
  { value: "en", label: "EN", name: "English" },
];

/** Compact FR / EN toggle. The choice is remembered on this device. */
export function LanguageSwitcher({ className }: { className?: string }) {
  const lang = useLang();

  return (
    <div
      role="group"
      aria-label={lang === "fr" ? "Langue du site" : "Site language"}
      className={cn("inline-flex items-center rounded-sm border border-border p-0.5", className)}
    >
      {OPTIONS.map((option) => {
        const active = option.value === lang;
        return (
          <button
            key={option.value}
            type="button"
            lang={option.value}
            onClick={() => setLang(option.value)}
            aria-pressed={active}
            aria-label={option.name}
            className={cn(
              "h-8 min-w-[2.25rem] rounded-[3px] px-2 font-mono text-[11.5px] font-medium tracking-[0.08em] transition-colors duration-200",
              active
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
