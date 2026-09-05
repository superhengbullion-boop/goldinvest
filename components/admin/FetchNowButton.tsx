"use client";

import { useFormStatus } from "react-dom";
import { fetchRatesNow } from "@/app/actions/admin";

function Submit() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} className="gold-btn py-2">
      {pending ? "Fetching…" : "Fetch now"}
    </button>
  );
}

export function FetchNowButton() {
  return (
    <form action={fetchRatesNow}>
      <Submit />
    </form>
  );
}
