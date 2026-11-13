import { useSyncExternalStore } from "react";

export type SelectedOffer = { id: string; name: string; price: number } | null;

let current: SelectedOffer = null;
const listeners = new Set<() => void>();

export function selectOffer(offer: SelectedOffer) {
  current = offer;
  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function useSelectedOffer(): SelectedOffer {
  return useSyncExternalStore(subscribe, () => current, () => null);
}
