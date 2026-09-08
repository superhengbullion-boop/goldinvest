import { formatPrice } from "@/lib/data";
import type { BoardRow } from "@/lib/metal-quotes";
import { formatRateStamp } from "@/lib/rate-time";

export function MetalRateTable({
  metal,
  rows,
  updatedAt,
  tone,
}: {
  metal: string;
  rows: BoardRow[];
  updatedAt: Date | null;
  tone: "gold" | "silver";
}) {
  const headerClass = tone === "gold" ? "bg-gold text-black" : "bg-ivory text-black";

  return (
    <div>
      {updatedAt ? (
        <p className="mb-2 text-right text-xs text-mist">
          Updated on {formatRateStamp(updatedAt)}
        </p>
      ) : null}
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead className={headerClass}>
            <tr>
              <th className="px-4 py-3 font-semibold max-md:px-2 max-md:py-2 max-md:text-sm">{metal}</th>
              <th className="px-4 py-3 text-right font-semibold max-md:px-2 max-md:py-2 max-md:text-sm">Buy</th>
              <th className="px-4 py-3 text-right font-semibold max-md:px-2 max-md:py-2 max-md:text-sm">Sell</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.key} className="border-t border-white/10">
                <td className="px-4 py-3 max-md:px-2 max-md:py-2 max-md:text-sm">{row.label}</td>
                <td className="px-4 py-3 text-right tabular-nums max-md:px-2 max-md:py-2 max-md:text-sm">
                  {formatPrice(row.buy, row.digits)}
                </td>
                <td className="px-4 py-3 text-right tabular-nums max-md:px-2 max-md:py-2 max-md:text-sm">
                  {formatPrice(row.sell, row.digits)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
