"use client";

import { MetalRateTable } from "@/components/MetalRateTable";
import { useMarketRates } from "@/components/MarketRatesProvider";

export function LiveRatesBoard() {
  const { loading, error, board, receivedAt } = useMarketRates();

  if (loading && board.rows.length === 0) {
    return <p className="mt-16 text-mist max-md:text-center">Loading live rates…</p>;
  }

  if (!loading && board.rows.length === 0) {
    return (
      <p className="mt-16 text-mist max-md:text-center">
        {error ?? "Rates will be published shortly."}
      </p>
    );
  }

  return (
    <div>
      {error ? (
        <p className="mb-4 text-center text-xs text-amber-400/90">
          Live update paused: {error}. Showing last received prices.
        </p>
      ) : null}
      <div className="mt-10 w-full">
        <MetalRateTable rows={board.rows} updatedAt={receivedAt ?? board.updatedAt} enableTrade />
      </div>
    </div>
  );
}
