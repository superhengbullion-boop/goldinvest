"use client";

import { useFormStatus } from "react-dom";
import { removeFromCart, updateCartQty } from "@/app/actions/cart";
import { placeCartOrder } from "@/app/actions/orders";
import { formatPrice } from "@/lib/format-price";
import { metalLabel } from "@/lib/metal-quotes";
import { lineTotalMyr, tradeSideLabel } from "@/lib/order-math";

type CartLine = {
  id: string;
  metal: string;
  side: string;
  lockedPrice: number;
  qtyKg: number;
};

function QtySubmit() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} className="text-xs text-gold hover:underline disabled:opacity-60">
      {pending ? "Updating…" : "Update"}
    </button>
  );
}

function RemoveSubmit() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} className="text-xs text-red-400 hover:underline disabled:opacity-60">
      {pending ? "Removing…" : "Remove"}
    </button>
  );
}

function PlaceSubmit() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} className="gold-btn px-6 py-3 disabled:opacity-60">
      {pending ? "Placing order…" : "Place order"}
    </button>
  );
}

export function CartPanel({
  items,
  placedOrderNo,
}: {
  items: CartLine[];
  placedOrderNo?: string | null;
}) {
  const grandTotal = items.reduce(
    (sum, item) => sum + lineTotalMyr(item.lockedPrice, item.qtyKg),
    0,
  );

  return (
    <div className="mt-8 space-y-6">
      {placedOrderNo ? (
        <p className="rounded border border-gold/40 bg-gold/10 px-4 py-3 text-sm text-gold" role="status">
          Order {placedOrderNo} placed. We will confirm shortly.
        </p>
      ) : null}

      {items.length === 0 ? (
        <p className="text-mist">Your cart is empty. Buy or sell MYR/KG from the rates board to add items.</p>
      ) : (
        <>
          <ul className="divide-y divide-white/10 border-y border-white/10">
            {items.map((item) => {
              const lineTotal = lineTotalMyr(item.lockedPrice, item.qtyKg);
              const side = tradeSideLabel(item.side);
              const lockLabel = item.side === "sell" ? "Super Heng BUY" : "Super Heng SELL";
              return (
                <li key={item.id} className="flex flex-col gap-4 py-5 md:flex-row md:items-center md:justify-between">
                  <div>
                    <p className="font-display text-xl text-gold">
                      {side} · {metalLabel(item.metal)}
                    </p>
                    <p className="mt-1 text-sm text-mist">
                      Locked {lockLabel} RM {formatPrice(item.lockedPrice, 0)} / kg · MYR/KG
                    </p>
                    <p className="mt-2 text-sm tabular-nums">
                      Line total: RM {formatPrice(lineTotal, 2)}
                    </p>
                  </div>
                  <div className="flex flex-wrap items-end gap-4">
                    <form action={updateCartQty} className="flex items-end gap-2">
                      <input type="hidden" name="itemId" value={item.id} />
                      <label className="text-xs text-mist">
                        Qty (kg)
                        <input
                          name="qtyKg"
                          type="number"
                          min="0.001"
                          step="any"
                          required
                          defaultValue={item.qtyKg}
                          className="mt-1 block w-28 border border-gold/30 bg-ink px-2 py-1.5 text-sm text-ivory"
                        />
                      </label>
                      <QtySubmit />
                    </form>
                    <form action={removeFromCart}>
                      <input type="hidden" name="itemId" value={item.id} />
                      <RemoveSubmit />
                    </form>
                  </div>
                </li>
              );
            })}
          </ul>

          <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-lg tabular-nums">
              Grand total:{" "}
              <span className="text-gold">RM {formatPrice(grandTotal, 2)}</span>
            </p>
            <form action={placeCartOrder}>
              <PlaceSubmit />
            </form>
          </div>
        </>
      )}
    </div>
  );
}
