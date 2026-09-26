"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { setOrderStatus } from "@/app/actions/orders";
import { ORDER_STATUSES, type OrderStatus } from "@/lib/order-math";

export function OrderStatusForm({
  orderId,
  status,
}: {
  orderId: string;
  status: string;
}) {
  const router = useRouter();
  const [value, setValue] = useState(status);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    setValue(status);
  }, [status]);

  return (
    <form
      className="mt-4 flex flex-wrap items-end gap-3"
      onSubmit={(e) => {
        e.preventDefault();
        setSaved(false);
        setError(null);
        const next = value as OrderStatus;
        const formData = new FormData();
        formData.set("orderId", orderId);
        formData.set("status", next);

        startTransition(async () => {
          try {
            await setOrderStatus(formData);
            setValue(next);
            setSaved(true);
            router.refresh();
          } catch (err) {
            setError(err instanceof Error ? err.message : "Save failed.");
          }
        });
      }}
    >
      <label className="text-xs text-mist">
        Status
        <select
          name="status"
          value={value}
          disabled={pending}
          onChange={(e) => {
            setValue(e.target.value);
            setSaved(false);
            setError(null);
          }}
          className="mt-1 block border border-gold/30 bg-ink px-3 py-2 text-sm text-ivory disabled:opacity-60"
        >
          {ORDER_STATUSES.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </select>
      </label>
      <button type="submit" disabled={pending} className="gold-btn py-2 disabled:opacity-60">
        {pending ? "Updating…" : "Update status"}
      </button>
      {saved ? (
        <p className="w-full text-sm text-gold" role="status">
          Status updated.
        </p>
      ) : null}
      {error ? (
        <p className="w-full text-sm text-red-400" role="alert">
          {error}
        </p>
      ) : null}
    </form>
  );
}
