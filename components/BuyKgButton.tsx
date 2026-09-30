"use client";

import { useState } from "react";
import { useFormStatus } from "react-dom";
import { addToCart } from "@/app/actions/cart";
import { Toast } from "@/components/Toast";

function BuySubmit() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="gold-btn px-6 py-2 text-sm font-semibold uppercase tracking-wide disabled:opacity-60"
    >
      {pending ? "Adding…" : "Buy"}
    </button>
  );
}

export function BuyKgButton({
  metal,
  sellPrice,
}: {
  metal: "XAU" | "XAG";
  sellPrice: number;
  digits?: number;
}) {
  const [error, setError] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);

  if (!Number.isFinite(sellPrice) || sellPrice <= 0) return null;

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
        <input type="hidden" name="lockedSellPrice" value={String(sellPrice)} />
        <input type="hidden" name="qtyKg" value="1" />
        <BuySubmit />
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
