"use client";

import { useState } from "react";
import { useFormStatus } from "react-dom";
import { isRedirectError } from "next/dist/client/components/redirect-error";
import { addToCart } from "@/app/actions/cart";
import { formatPrice } from "@/lib/format-price";

function AddSubmit() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} className="gold-btn px-3 py-1.5 text-xs disabled:opacity-60">
      {pending ? "Adding…" : "Add to cart"}
    </button>
  );
}

export function BuyKgButton({
  metal,
  sellPrice,
  digits,
}: {
  metal: "XAU" | "XAG";
  sellPrice: number;
  digits: number;
}) {
  const [open, setOpen] = useState(false);
  const [qty, setQty] = useState("1");
  const [error, setError] = useState<string | null>(null);

  if (!Number.isFinite(sellPrice) || sellPrice <= 0) return null;

  return (
    <div className="mt-2 text-left">
      {!open ? (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="text-xs uppercase tracking-wide text-gold hover:underline"
        >
          Buy
        </button>
      ) : (
        <form
          className="space-y-2 rounded border border-gold/30 bg-black/40 p-3"
          action={async (formData) => {
            setError(null);
            try {
              await addToCart(formData);
            } catch (err) {
              if (isRedirectError(err)) throw err;
              setError(err instanceof Error ? err.message : "Could not add to cart.");
            }
          }}
        >
          <input type="hidden" name="metal" value={metal} />
          <input type="hidden" name="lockedSellPrice" value={String(sellPrice)} />
          <p className="text-xs text-mist">
            Locked sell: RM {formatPrice(sellPrice, digits)} / kg
          </p>
          <label className="block text-xs text-mist">
            Quantity (kg)
            <input
              name="qtyKg"
              type="number"
              min="0.001"
              step="any"
              required
              value={qty}
              onChange={(e) => setQty(e.target.value)}
              className="mt-1 w-full border border-gold/30 bg-ink px-2 py-1.5 text-sm text-ivory"
            />
          </label>
          <div className="flex items-center gap-3">
            <AddSubmit />
            <button
              type="button"
              className="text-xs text-mist hover:text-ivory"
              onClick={() => {
                setOpen(false);
                setError(null);
              }}
            >
              Cancel
            </button>
          </div>
          {error ? <p className="text-xs text-red-400">{error}</p> : null}
        </form>
      )}
    </div>
  );
}
