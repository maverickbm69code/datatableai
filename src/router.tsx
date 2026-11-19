import Index from "./pages/Index";

export const routers = [
  {
    path: "/",
    name: "home",
    element: <Index />,
  },
  {
    path: "/admin",
    name: "admin",
    // Loaded on demand: visitors of the public pages never download it.
    lazy: () => import("./pages/Admin").then((m) => ({ Component: m.default })),
  },
  /* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */
  {
    path: "*",
    name: "404",
    lazy: () => import("./pages/NotFound").then((m) => ({ Component: m.default })),
  },
];

declare global {
  interface Window {
    __routers__: typeof routers;
  }
}

window.__routers__ = routers;
