"use client";

import { useState } from "react";
import { useFormStatus } from "react-dom";
import { fetchRatesNow } from "@/app/actions/admin";

function Submit({ done }: { done: boolean }) {
  const { pending } = useFormStatus();
  return (
    <div className="flex flex-wrap items-center gap-3">
      <button type="submit" disabled={pending} className="gold-btn py-2">
        {pending ? "Fetching…" : "Fetch now"}
      </button>
      {done && !pending ? (
        <span className="text-sm text-gold" role="status">
          Quotes refreshed successfully.
        </span>
      ) : null}
    </div>
  );
}

export function FetchNowButton() {
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  return (
    <form
      action={async () => {
        setDone(false);
        setError(null);
        try {
          await fetchRatesNow();
          setDone(true);
        } catch (err) {
          setError(err instanceof Error ? err.message : "Fetch failed.");
        }
      }}
    >
      <Submit done={done} />
      {error ? (
        <p className="mt-2 text-sm text-red-400" role="alert">
          {error}
        </p>
      ) : null}
    </form>
  );
}
