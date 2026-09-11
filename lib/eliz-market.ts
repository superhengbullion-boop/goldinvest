export type ElizSide = {
  buy: string;
  sell: string;
  available: boolean;
};

export type ElizMarketSnapshot = {
  price: {
    usd: ElizSide;
    myr: ElizSide;
    offline?: { available: boolean };
    updatedAt: string;
  };
  myrRate: {
    askPrice: string;
    bidPrice: string;
    highPrice: string;
    lowPrice: string;
    updatedAt: string;
    source: string;
  };
};

export const ELIZ_CURRENCY = "ELIZ";

const DEFAULT_XAU_URL = "https://api.eliz.gold/v0/web/public/xau/market_snapshot";
const DEFAULT_XAG_URL = "https://api.eliz.gold/v0/web/public/xag/market_snapshot";

export function getElizXauUrl() {
  return (
    process.env.ELIZ_XAU_URL ??
    process.env.NEXT_PUBLIC_ELIZ_XAU_URL ??
    DEFAULT_XAU_URL
  );
}

export function getElizXagUrl() {
  return (
    process.env.ELIZ_XAG_URL ??
    process.env.NEXT_PUBLIC_ELIZ_XAG_URL ??
    DEFAULT_XAG_URL
  );
}

export async function fetchElizSnapshot(url: string): Promise<ElizMarketSnapshot> {
  const res = await fetch(url, {
    method: "GET",
    cache: "no-store",
    credentials: "omit",
  });
  if (!res.ok) {
    throw new Error(`Market snapshot failed (${res.status})`);
  }
  return (await res.json()) as ElizMarketSnapshot;
}
