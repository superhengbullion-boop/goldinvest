export const MARKET_POLL_MS = 3000;

export type MarketTickerItem = {
  metal: string;
  product: string;
  buyPrice: number;
  sellPrice: number;
  currency?: string;
};

export type MarketBoardRow = {
  key: string;
  label: string;
  buy: number;
  sell: number;
  digits: number;
};

export type MarketMetalPayload = {
  rows: MarketBoardRow[];
  updatedAt: string | null;
};

export type MarketApiResponse = {
  ok: boolean;
  assigned: boolean;
  ticker: MarketTickerItem[];
  gold: MarketMetalPayload;
  silver: MarketMetalPayload;
  error?: string;
};
