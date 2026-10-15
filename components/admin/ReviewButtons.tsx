"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

export function ReviewButtons({
  id,
  action,
}: {
  id: string;
  action: (formData: FormData) => Promise<void>;
}) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function submit(decision: "approve" | "reject") {
    const formData = new FormData();
    formData.set("id", id);
    formData.set("decision", decision);
    setError(null);
    startTransition(async () => {
      try {
        await action(formData);
        router.refresh();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Could not update this request.");
      }
    });
  }

  return (
    <div className="mt-4 flex flex-wrap gap-3">
      <button type="button" disabled={pending} onClick={() => submit("approve")} className="gold-btn py-2">
        Approve
      </button>
      <button type="button" disabled={pending} onClick={() => submit("reject")} className="rounded-lg border border-gold/30 px-4 py-2 text-sm">
        Reject
      </button>
      {error ? <p className="w-full text-sm text-red-300">{error}</p> : null}
    </div>
  );
}
