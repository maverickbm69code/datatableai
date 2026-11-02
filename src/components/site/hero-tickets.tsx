import { BrasserieTicket } from "@/components/site/brasserie-ticket";
import { CoffeeTicket } from "@/components/site/coffee-ticket";

/** Two receipts laid on the counter: a coffee shop behind a Parisian brasserie. */
export function HeroTickets() {
  return (
    <div className="relative w-full max-w-[400px]">
      <div className="relative z-0 ml-auto w-[86%] max-w-[336px] rotate-[4deg] transition-transform duration-500 hover:rotate-[3deg] motion-reduce:transition-none">
        <CoffeeTicket />
      </div>
      <div className="relative z-10 -mt-10 rotate-[-2deg] transition-transform duration-500 hover:rotate-[-1.2deg] motion-reduce:transition-none sm:-mt-14">
        <BrasserieTicket />
      </div>
    </div>
  );
}
