import { PaperTicket, type TicketRow } from "@/components/site/paper-ticket";

const ROWS: TicketRow[] = [
  {
    key: "patisseries",
    label: "Part pâtisseries",
    detail: "18,2 % → 21 %",
    value: 9400,
    prefix: "+",
    suffix: " €",
    gain: true,
  },
  {
    key: "chaudes",
    label: "Boissons chaudes",
    detail: "1,05 → 1,30 / ticket",
    value: 7200,
    prefix: "+",
    suffix: " €",
    gain: true,
  },
];

/** Second example, on a smaller receipt: a coffee shop. */
export function CoffeeTicket() {
  return (
    <PaperTicket
      headline="Rapport du mois · Sept. 2026"
      meta="Coffee shop · 6 130 tickets"
      note="Exemple illustratif."
      rows={ROWS}
      totalLabel="Levier / an"
      totalValue={24100}
      className="pb-24"
    />
  );
}
