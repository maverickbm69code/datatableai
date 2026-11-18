import Admin from "./pages/Admin";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import { lazy, Suspense } from "react";

// Loaded on demand so the home page's bundle does not grow with the new section.
const ResourceArticle = lazy(() => import("./pages/resources/article"));
const ResourcesIndex = lazy(() => import("./pages/resources/index"));

export const routers = [
  {
    path: "/",
    name: "home",
    element: <Index />,
  },
  {
    path: "/admin",
    name: "admin",
    element: <Admin />,
  },
  {
    path: "/ressources",
    name: "resources",
    element: (
      <Suspense fallback={null}>
        <ResourcesIndex />
      </Suspense>
    ),
  },
  {
    path: "/ressources/:slug",
    name: "resource-article",
    element: (
      <Suspense fallback={null}>
        <ResourceArticle />
      </Suspense>
    ),
  },
  /* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */
  {
    path: "*",
    name: "404",
    element: <NotFound />,
  },
];

declare global {
  interface Window {
    __routers__: typeof routers;
  }
}

window.__routers__ = routers;
