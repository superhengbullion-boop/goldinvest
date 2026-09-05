import { formatPrice } from "@/lib/data";

type Rate = {
  metal: string;
  product: string;
  buyPrice: { toString(): string } | number;
  sellPrice: { toString(): string } | number;
  currency?: string;
};

export function RateTicker({ rates }: { rates: Rate[] }) {
  if (rates.length === 0) return null;
  const items = [...rates, ...rates];

  return (
    <div className="ticker">
      <div className="ticker-track py-2 text-xs uppercase tracking-[0.18em] text-mist">
        {items.map((rate, i) => (
          <span key={`${rate.metal}-${rate.product}-${i}`} className="mx-8 inline-flex gap-3">
            <span className="text-gold">{rate.metal}</span>
            <span>{rate.product}</span>
            <span>
              Buy <span className="text-ivory">{formatPrice(rate.buyPrice)}</span>
            </span>
            <span>
              Sell <span className="text-ivory">{formatPrice(rate.sellPrice)}</span>
            </span>
          </span>
        ))}
      </div>
    </div>
  );
}
