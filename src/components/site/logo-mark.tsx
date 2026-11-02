import { cn } from "@/lib/utils";

/**
 * The Datable mark. Two files are used so the black part of the logo turns
 * white on dark backgrounds while the brand blue stays untouched.
 */
export function DatableGlyph({ className }: { className?: string }) {
  return (
    <span className={cn("block shrink-0", className)}>
      <img
        src="/logo-mark.png"
        alt=""
        width={512}
        height={512}
        className="h-full w-full object-contain dark:hidden"
      />
      <img
        src="/logo-mark-dark.png"
        alt=""
        width={512}
        height={512}
        className="hidden h-full w-full object-contain dark:block"
      />
    </span>
  );
}

type DatableWordmarkProps = {
  className?: string;
  tone?: "light" | "band";
};

export function DatableWordmark({ className, tone = "light" }: DatableWordmarkProps) {
  return (
    <span className={cn("flex items-center gap-2.5", className)}>
      <DatableGlyph className="h-9 w-9" />
      <span
        className={cn(
          "font-display text-[19px] font-bold tracking-[-0.035em]",
          tone === "band" ? "text-band-foreground" : "text-foreground",
        )}
      >
        Datable
      </span>
    </span>
  );
}
