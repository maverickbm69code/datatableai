import { PaperTicket, type TicketRow } from "@/components/site/paper-ticket";
import { useCopy } from "@/lib/i18n";

const ROWS_FR: TicketRow[] = [
  {
    key: "boissons",
    label: "Part boissons",
    detail: "30,4 % → 32 %",
    value: 47500,
    prefix: "+",
    suffix: " €",
    gain: true,
  },
  {
    key: "cafes",
    label: "Cafés",
    detail: "0,12 → 0,20 / couvert",
    value: 11000,
    prefix: "+",
    suffix: " €",
    gain: true,
  },
  { key: "cave", label: "Cave", detail: "références dormantes", value: 24 },
  { key: "erreurs", label: "Erreurs de paramétrage caisse", value: 5 },
];

const ROWS_EN: TicketRow[] = [
  { ...ROWS_FR[0], label: "Drinks share", detail: "30.4% → 32%" },
  { ...ROWS_FR[1], label: "Coffees", detail: "0.12 → 0.20 / cover" },
  { ...ROWS_FR[2], label: "Wine cellar", detail: "slow-moving bottles" },
  { ...ROWS_FR[3], label: "POS setup errors" },
];

const COPY = {
  fr: {
    rows: ROWS_FR,
    headline: "Rapport du mois · Sept. 2026",
    meta: "Brasserie parisienne · 7 747 couverts",
    totalLabel: "Levier / an",
    footerNote: "Exemple réel, établissement anonymisé.",
    footerSignOff: "Merci de votre visite.",
  },
  en: {
    rows: ROWS_EN,
    headline: "Monthly report · Sept. 2026",
    meta: "Parisian brasserie · 7,747 covers",
    totalLabel: "Upside / year",
    footerNote: "Real example, venue anonymized.",
    footerSignOff: "Thank you for your visit.",
  },
};

export function BrasserieTicket() {
  const t = useCopy(COPY);
  return (
    <PaperTicket
      headline={t.headline}
      meta={t.meta}
      rows={t.rows}
      totalLabel={t.totalLabel}
      totalValue={58500}
      footerNote={t.footerNote}
      footerSignOff={t.footerSignOff}
    />
  );
}
