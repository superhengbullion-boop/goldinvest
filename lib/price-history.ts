import type { ElizMarketSnapshot } from "@/lib/eliz-market";

export const SAMPLE_GAP_MS = 15 * 60 * 1000;

export const PRICE_PAIRS = ["xau_myr", "xau_usd"] as const;
export const PRICE_SIDES = ["buy", "sell"] as const;

export const PRICE_FRAMES = [
  { id: "1M", ms: 60 * 1000 },
  { id: "15M", ms: 15 * 60 * 1000 },
  { id: "1H", ms: 60 * 60 * 1000 },
  { id: "1D", ms: 24 * 60 * 60 * 1000 },
] as const;

export type PriceFrameId = (typeof PRICE_FRAMES)[number]["id"];

const KL_OFFSET_MS = 8 * 60 * 60 * 1000;

export function barMinute(at: Date) {
  return new Date(Math.floor(at.getTime() / 60_000) * 60_000);
}

export function frameBucket(at: Date, frame: PriceFrameId) {
  if (frame === "1D") {
    const shifted = at.getTime() + KL_OFFSET_MS;
    const day = Math.floor(shifted / 86_400_000) * 86_400_000;
    return new Date(day - KL_OFFSET_MS);
  }
  const size = PRICE_FRAMES.find((item) => item.id === frame)?.ms ?? 60_000;
  return new Date(Math.floor(at.getTime() / size) * size);
}

export function isPriceFrame(value: string): value is PriceFrameId {
  return PRICE_FRAMES.some((item) => item.id === value);
}

export type Candle = {
  at: Date;
  open: number;
  high: number;
  low: number;
  close: number;
};

export function aggregateCandles(bars: Candle[], frame: PriceFrameId): Candle[] {
  const candles: Candle[] = [];
  for (const bar of bars) {
    const at = frameBucket(bar.at, frame);
    const last = candles[candles.length - 1];
    if (!last || last.at.getTime() !== at.getTime()) {
      candles.push({ at, open: bar.open, high: bar.high, low: bar.low, close: bar.close });
      continue;
    }
    last.high = Math.max(last.high, bar.high);
    last.low = Math.min(last.low, bar.low);
    last.close = bar.close;
  }
  return candles;
}

export const PRICE_RANGES = [
  { id: "1D", days: 1 },
  { id: "5D", days: 5 },
  { id: "1M", days: 30 },
  { id: "3M", days: 90 },
  { id: "6M", days: 180 },
  { id: "1Y", days: 365 },
] as const;

export type PricePair = (typeof PRICE_PAIRS)[number];
export type PriceSide = (typeof PRICE_SIDES)[number];
export type PriceRangeId = (typeof PRICE_RANGES)[number]["id"];

const DAY_MS = 24 * 60 * 60 * 1000;

export function myrPerGram(perKg: number) {
  return perKg / 1000;
}

export function shouldStoreSample(lastRecordedAt: Date | null, now: Date) {
  if (!lastRecordedAt) return true;
  return now.getTime() - lastRecordedAt.getTime() >= SAMPLE_GAP_MS;
}

export function visibleRanges(oldest: Date | null, now: Date): PriceRangeId[] {
  const shown: PriceRangeId[] = ["1D"];
  if (!oldest) return shown;
  const age = now.getTime() - oldest.getTime();
  for (const range of PRICE_RANGES) {
    if (range.id === "1D") continue;
    if (age >= range.days * DAY_MS) shown.push(range.id);
  }
  return shown;
}

export function rangeWindowMs(id: string) {
  const range = PRICE_RANGES.find((item) => item.id === id);
  return range ? range.days * DAY_MS : null;
}

export function pairUnit(pair: PricePair) {
  return pair === "xau_myr" ? "MYR/g" : "USD/oz";
}

export function formatSamplePrice(pair: PricePair, value: number) {
  return pair === "xau_myr" ? value.toFixed(3) : value.toFixed(2);
}

export function isPricePair(value: string): value is PricePair {
  return (PRICE_PAIRS as readonly string[]).includes(value);
}

export function isPriceSide(value: string): value is PriceSide {
  return (PRICE_SIDES as readonly string[]).includes(value);
}

export function isPriceRange(value: string): value is PriceRangeId {
  return PRICE_RANGES.some((item) => item.id === value);
}

function num(value: string | undefined) {
  if (value == null || value.trim() === "") return null;
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

export type SampleDraft = {
  pair: PricePair;
  buy: number;
  sell: number;
  marketOpen: boolean;
};

/** Rate-book deltas match the web board: MYR deltas are per kilogram, USD deltas are per ounce. */
export function adjustedQuote(draft: SampleDraft, buyDelta: number, sellDelta: number): SampleDraft {
  const scale = draft.pair === "xau_myr" ? 1000 : 1;
  const buyAdj = Number.isFinite(buyDelta) ? buyDelta : 0;
  const sellAdj = Number.isFinite(sellDelta) ? sellDelta : 0;
  return {
    ...draft,
    sell: Math.max(0, draft.sell + buyAdj / scale),
    buy: Math.max(0, draft.buy + sellAdj / scale),
  };
}

export function samplesFromSnapshot(snapshot: ElizMarketSnapshot): SampleDraft[] {
  const rows: SampleDraft[] = [];
  const myrBuy = num(snapshot.price?.myr?.buy);
  const myrSell = num(snapshot.price?.myr?.sell);
  const usdBuy = num(snapshot.price?.usd?.buy);
  const usdSell = num(snapshot.price?.usd?.sell);
  // The snapshot names prices from the house. The app names them from the member:
  // the member sells at the lower quote and buys at the higher quote.
  if (myrBuy != null && myrSell != null) {
    rows.push({
      pair: "xau_myr",
      buy: myrPerGram(myrSell),
      sell: myrPerGram(myrBuy),
      marketOpen: snapshot.price.myr.available !== false,
    });
  }
  if (usdBuy != null && usdSell != null) {
    rows.push({
      pair: "xau_usd",
      buy: usdSell,
      sell: usdBuy,
      marketOpen: snapshot.price.usd.available !== false,
    });
  }
  return rows;
}
