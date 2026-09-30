"use client";

import { useState } from "react";
import { useFormStatus } from "react-dom";
import { addToCart } from "@/app/actions/cart";
import { Toast } from "@/components/Toast";
import type { TradeSide } from "@/lib/order-math";

function TradeSubmit({ side }: { side: TradeSide }) {
  const { pending } = useFormStatus();
  const label = side === "sell" ? "LOCK SELL" : "LOCK BUY";
  return (
    <button
      type="submit"
      disabled={pending}
      className="inline-flex items-center justify-center rounded-full bg-gold px-3 py-1.5 text-[11px] font-semibold uppercase leading-none tracking-wide text-white transition-colors hover:bg-gold-dark disabled:opacity-60 max-md:px-2.5 max-md:py-1 max-md:text-[10px]"
    >
      {pending ? "…" : label}
    </button>
  );
}

export function TradeKgButton({
  metal,
  side,
  lockedPrice,
}: {
  metal: "XAU" | "XAG";
  side: TradeSide;
  lockedPrice: number;
  digits?: number;
}) {
  const [error, setError] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);

  if (!Number.isFinite(lockedPrice) || lockedPrice <= 0) return null;
  if (side === "sell" && metal !== "XAU") return null;

  return (
    <div className="flex flex-col items-center gap-1">
      <form
        className="flex justify-center"
        action={async (formData) => {
          setError(null);
          try {
            await addToCart(formData);
            setShowSuccess(true);
          } catch (err) {
            setError(err instanceof Error ? err.message : "Could not add to cart.");
          }
        }}
      >
        <input type="hidden" name="metal" value={metal} />
        <input type="hidden" name="side" value={side} />
        <input type="hidden" name="lockedPrice" value={String(lockedPrice)} />
        <input type="hidden" name="qtyKg" value="1" />
        <TradeSubmit side={side} />
      </form>
      {error ? <p className="text-xs text-red-400">{error}</p> : null}
      <Toast
        message="Successfully added to the cart."
        show={showSuccess}
        onClose={() => setShowSuccess(false)}
      />
    </div>
  );
}

/** @deprecated Prefer TradeKgButton */
export function BuyKgButton({
  metal,
  sellPrice,
}: {
  metal: "XAU" | "XAG";
  sellPrice: number;
  digits?: number;
}) {
  return <TradeKgButton metal={metal} side="buy" lockedPrice={sellPrice} />;
}
