import { PaperTicket, type TicketRow } from "@/components/site/paper-ticket";
import { useCopy } from "@/lib/i18n";

const ROWS_FR: TicketRow[] = [
  {
    key: "patisseries",
    label: "Part pâtisseries",
    detail: "18,2 % → 21 %",
    value: 9400,
    prefix: "+",
    currency: true,
    gain: true,
  },
  {
    key: "chaudes",
    label: "Boissons chaudes",
    detail: "1,05 → 1,30 / ticket",
    value: 7200,
    prefix: "+",
    currency: true,
    gain: true,
  },
];

const ROWS_EN: TicketRow[] = [
  { ...ROWS_FR[0], label: "Pastry mix", detail: "18.2% → 21%" },
  { ...ROWS_FR[1], label: "Hot beverages", detail: "1.05 → 1.30 / check" },
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
    headline: "Monthly report · Sep 2026",
    meta: "Coffee shop · 6,130 checks",
    note: "Sample report for illustration.",
    totalLabel: "Annual upside",
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
