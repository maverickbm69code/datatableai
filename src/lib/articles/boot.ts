// Data handed over by the prerendered HTML (see scripts/prerender.mjs): the browser can start
// from it instead of waiting for a request. Absent in dev and after client-side navigation.
import { createContext } from "react";

import type { ResourcesBootData } from "@/lib/articles/types";

export const BOOT_ELEMENT_ID = "dt-resources-data";

/** Provided by the prerender entry (no document there); the browser reads the embedded JSON. */
export const BootDataContext = createContext<ResourcesBootData | null>(null);

let cached: ResourcesBootData | null | undefined;

export function readBootFromDocument(): ResourcesBootData | null {
  if (cached !== undefined) return cached;
  cached = null;
  if (typeof document === "undefined") return cached;
  try {
    const node = document.getElementById(BOOT_ELEMENT_ID);
    if (node?.textContent) cached = JSON.parse(node.textContent) as ResourcesBootData;
  } catch {
    cached = null;
  }
  return cached;
}
