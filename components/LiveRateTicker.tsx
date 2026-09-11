"use client";

import { RateTicker } from "@/components/RateTicker";
import { useMarketRates } from "@/components/MarketRatesProvider";

export function LiveRateTicker() {
  const { enabled, ticker } = useMarketRates();
  if (!enabled) return null;
  return <RateTicker rates={ticker} />;
}
