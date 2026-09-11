"use client";

import { useEffect, useRef, useState } from "react";
import { formatPrice } from "@/lib/format-price";
import type { BoardRow } from "@/lib/metal-quotes";
import { formatRateStamp } from "@/lib/rate-time";

function PriceCell({ value, digits }: { value: number; digits: number }) {
  const prev = useRef(value);
  const [flash, setFlash] = useState(false);

  useEffect(() => {
    if (prev.current === value) return;
    prev.current = value;
    setFlash(false);
    const frame = window.requestAnimationFrame(() => setFlash(true));
    const timer = window.setTimeout(() => setFlash(false), 700);
    return () => {
      window.cancelAnimationFrame(frame);
      window.clearTimeout(timer);
    };
  }, [value]);

  return (
    <td
      className={`px-4 py-3 text-right tabular-nums max-md:px-2 max-md:py-2 max-md:text-sm ${
        flash ? "rate-flash" : ""
      }`}
    >
      {formatPrice(value, digits)}
    </td>
  );
}

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
                <PriceCell value={row.buy} digits={row.digits} />
                <PriceCell value={row.sell} digits={row.digits} />
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
