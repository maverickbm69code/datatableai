import type { ReactNode } from "react";

import { SiteFooter } from "@/components/site/site-footer";
import { SiteHeader } from "@/components/site/site-header";

/** Same page frame as the home page: sticky header, main, footer. */
export function ResourcesLayout({
  children,
  languageSlot,
}: {
  children: ReactNode;
  languageSlot?: ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SiteHeader onHome={false} languageSlot={languageSlot} />
      <main className="flex-1">{children}</main>
      <SiteFooter />
    </div>
  );
}
