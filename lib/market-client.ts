import type { MarketApiResponse } from "@/lib/market-types";

export { MARKET_POLL_MS } from "@/lib/market-types";

export async function fetchMarketRates(): Promise<MarketApiResponse> {
  const res = await fetch("/api/rates/market", {
    method: "GET",
    cache: "no-store",
    credentials: "same-origin",
  });

  const data = (await res.json()) as MarketApiResponse;
  if (!res.ok || !data.ok) {
    throw new Error(data.error ?? `Market request failed (${res.status})`);
  }
  return data;
}
