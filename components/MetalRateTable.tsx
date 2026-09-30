"use client";

import { useEffect, useRef, useState } from "react";
import { BuyKgButton } from "@/components/BuyKgButton";
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

const BUY_METAL_BY_ROW_KEY: Record<string, "XAU" | "XAG"> = {
  "physical-gold-myr-kg": "XAU",
  "physical-silver-myr-kg": "XAG",
};

export function MetalRateTable({
  rows,
  updatedAt,
  titleLabel = "HENG Precious Metals",
  buyLabel = "Super Heng BUY",
  sellLabel = "Super Heng SELL",
  enableBuy = false,
}: {
  rows: BoardRow[];
  updatedAt: Date | null;
  titleLabel?: string;
  buyLabel?: string;
  sellLabel?: string;
  enableBuy?: boolean;
}) {
  return (
    <div>
      {updatedAt ? (
        <p className="mb-2 text-right text-xs text-mist">
          Updated on {formatRateStamp(updatedAt)}
        </p>
      ) : null}
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-gold text-black">
            <tr>
              <th className="px-4 py-3 font-semibold max-md:px-2 max-md:py-2 max-md:text-sm">
                {titleLabel}
              </th>
              <th className="px-4 py-3 text-right font-semibold max-md:px-2 max-md:py-2 max-md:text-sm">
                {buyLabel}
              </th>
              <th className="px-4 py-3 text-right font-semibold max-md:px-2 max-md:py-2 max-md:text-sm">
                {sellLabel}
              </th>
              {enableBuy ? (
                <th className="px-4 py-3 text-center font-semibold max-md:px-2 max-md:py-2 max-md:text-sm">
                  Action
                </th>
              ) : null}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => {
              const buyMetal = BUY_METAL_BY_ROW_KEY[row.key];
              return (
                <tr key={row.key} className="border-t border-white/10">
                  <td className="px-4 py-3 max-md:px-2 max-md:py-2 max-md:text-sm">{row.label}</td>
                  {row.comingSoon ? (
                    <td
                      colSpan={2}
                      className="px-4 py-3 text-right text-mist italic max-md:px-2 max-md:py-2 max-md:text-sm"
                    >
                      Coming Soon
                    </td>
                  ) : (
                    <>
                      <PriceCell value={row.buy} digits={row.digits} />
                      <PriceCell value={row.sell} digits={row.digits} />
                    </>
                  )}
                  {enableBuy ? (
                    <td className="px-4 py-3 text-center max-md:px-2 max-md:py-2 max-md:text-sm">
                      {buyMetal ? (
                        <BuyKgButton metal={buyMetal} sellPrice={row.sell} digits={row.digits} />
                      ) : null}
                    </td>
                  ) : null}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
