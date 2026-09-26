"use client";

import { useRouter } from "next/navigation";
import { HISTORY_PAGE_LIMITS } from "@/lib/order-math";

export function HistoryLimitSelect({
  limit,
  page,
}: {
  limit: number;
  page: number;
}) {
  const router = useRouter();

  return (
    <label className="flex items-center gap-2 text-sm text-mist">
      Per page
      <select
        value={limit}
        className="border border-gold/30 bg-ink px-2 py-1.5 text-ivory"
        onChange={(e) => {
          const next = e.target.value;
          const params = new URLSearchParams();
          params.set("limit", next);
          if (page > 1) params.set("page", "1");
          router.push(`/portal/history?${params.toString()}`);
        }}
      >
        {HISTORY_PAGE_LIMITS.map((n) => (
          <option key={n} value={n}>
            {n}
          </option>
        ))}
      </select>
    </label>
  );
}
