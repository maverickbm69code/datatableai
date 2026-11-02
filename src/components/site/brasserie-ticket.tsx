import { PaperTicket, type TicketRow } from "@/components/site/paper-ticket";

const ROWS: TicketRow[] = [
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

export function BrasserieTicket() {
  return (
    <PaperTicket
      headline="Rapport du mois · Sept. 2026"
      meta="Brasserie parisienne · 7 747 couverts"
      rows={ROWS}
      totalLabel="Levier / an"
      totalValue={58500}
      footerNote="Exemple réel, établissement anonymisé."
      footerSignOff="Merci de votre visite."
    />
  );
}
