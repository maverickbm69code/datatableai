// Build-time only: renders the public home page to static HTML so crawlers that
// do not run JavaScript (AI search bots, link previews) can read its content.
// Used by scripts/prerender.mjs; never imported by the browser bundle.
import { renderToString } from "react-dom/server";
import { MemoryRouter } from "react-router-dom";
import { TooltipProvider } from "@/components/ui/tooltip";
import Index from "@/pages/Index";

export function render(): string {
  return renderToString(
    <MemoryRouter initialEntries={["/"]}>
      <TooltipProvider>
        <Index />
      </TooltipProvider>
    </MemoryRouter>,
  );
}
