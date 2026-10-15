"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { reviewDepositAction } from "@/app/actions/deposits";

export function DepositReviewForm({ id, kind }: { id: string; kind: string }) {
  const router = useRouter();
  const [amount, setAmount] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const unit = kind === "xau" ? "grams" : "RM";

  function submit(decision: "approve" | "reject") {
    setError(null);
    const formData = new FormData();
    formData.set("id", id);
    formData.set("decision", decision);
    formData.set("amount", amount);
    startTransition(async () => {
      try {
        await reviewDepositAction(formData);
        setAmount("");
        router.refresh();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Could not update the deposit.");
      }
    });
  }

  return (
    <div className="mt-4 flex flex-wrap items-end gap-3">
      <label className="block">
        <span className="mb-2 block text-sm text-mist">
          {kind === "xau" ? "Gold received (g)" : "Amount received (RM)"}
        </span>
        <input
          value={amount}
          inputMode="decimal"
          onChange={(event) => setAmount(event.target.value)}
          placeholder={unit}
          className="w-48 rounded-lg border border-gold/30 bg-ink px-4 py-3 outline-none focus:border-gold"
        />
      </label>
      <button
        type="button"
        disabled={pending}
        onClick={() => submit("approve")}
        className="gold-btn py-3"
      >
        Approve and credit
      </button>
      <button
        type="button"
        disabled={pending}
        onClick={() => submit("reject")}
        className="rounded-lg border border-gold/30 px-4 py-3 text-sm text-ivory hover:border-gold"
      >
        Reject
      </button>
      {error ? <p className="w-full text-sm text-red-300">{error}</p> : null}
    </div>
  );
}
