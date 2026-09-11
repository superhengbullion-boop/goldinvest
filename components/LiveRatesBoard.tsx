"use client";

import { MetalRateTable } from "@/components/MetalRateTable";
import { useMarketRates } from "@/components/MarketRatesProvider";

export function LiveRatesBoard() {
  const { loading, error, gold, silver } = useMarketRates();

  if (loading && gold.rows.length === 0 && silver.rows.length === 0) {
    return <p className="mt-16 text-mist max-md:text-center">Loading live rates…</p>;
  }

  if (!loading && gold.rows.length === 0 && silver.rows.length === 0) {
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
      <div className="mt-10 grid grid-cols-2 gap-10 max-md:grid-cols-1 max-md:gap-12">
        {gold.rows.length > 0 ? (
          <MetalRateTable metal="Gold" rows={gold.rows} updatedAt={gold.updatedAt} tone="gold" />
        ) : null}
        {silver.rows.length > 0 ? (
          <MetalRateTable
            metal="Silver"
            rows={silver.rows}
            updatedAt={silver.updatedAt}
            tone="silver"
          />
        ) : null}
      </div>
    </div>
  );
}
