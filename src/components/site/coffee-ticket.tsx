import { PaperTicket, type TicketRow } from "@/components/site/paper-ticket";
import { useCopy } from "@/lib/i18n";

const ROWS_FR: TicketRow[] = [
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

const ROWS_EN: TicketRow[] = [
  { ...ROWS_FR[0], label: "Pastry share", detail: "18.2% → 21%" },
  { ...ROWS_FR[1], label: "Hot drinks", detail: "1.05 → 1.30 / ticket" },
];

const COPY = {
  fr: {
    rows: ROWS_FR,
    headline: "Rapport du mois · Sept. 2026",
    meta: "Coffee shop · 6 130 tickets",
    note: "Exemple illustratif.",
    totalLabel: "Levier / an",
  },
  en: {
    rows: ROWS_EN,
    headline: "Monthly report · Sept. 2026",
    meta: "Coffee shop · 6,130 tickets",
    note: "Illustrative example.",
    totalLabel: "Upside / year",
  },
};

/** Second example, on a smaller receipt: a coffee shop. */
export function CoffeeTicket() {
  const t = useCopy(COPY);
  return (
    <PaperTicket
      headline={t.headline}
      meta={t.meta}
      note={t.note}
      rows={t.rows}
      totalLabel={t.totalLabel}
      totalValue={24100}
      className="pb-24"
    />
  );
}
