import "server-only";
import { execute, query, queryOne, asBool } from "@/lib/db";
import { fetchElizSnapshot, getElizXauUrl, type ElizMarketSnapshot } from "@/lib/eliz-market";
import {
  adjustedQuote,
  aggregateCandles,
  barMinute,
  formatSamplePrice,
  isPriceFrame,
  isPricePair,
  isPriceRange,
  isPriceSide,
  pairUnit,
  rangeWindowMs,
  samplesFromSnapshot,
  visibleRanges,
  type Candle,
  type PriceFrameId,
  type PricePair,
  type PriceRangeId,
  type PriceSide,
  type SampleDraft,
} from "@/lib/price-history";

function asDate(value: Date | string | null | undefined) {
  if (!value) return null;
  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

function asNumber(value: string | number) {
  return typeof value === "number" ? value : Number(value);
}

export async function recordXauSamples(snapshot: ElizMarketSnapshot, now = new Date()) {
  const minute = barMinute(now);
  const drafts = samplesFromSnapshot(snapshot);
  for (const draft of drafts) {
    await execute(
      `INSERT INTO \`PriceBar\`(
         \`pair\`,\`minute\`,
         \`buyOpen\`,\`buyHigh\`,\`buyLow\`,\`buyClose\`,
         \`sellOpen\`,\`sellHigh\`,\`sellLow\`,\`sellClose\`,
         \`marketOpen\`,\`updatedAt\`
       ) VALUES(?,?,?,?,?,?,?,?,?,?,?,?)
       ON DUPLICATE KEY UPDATE
         \`buyHigh\`=GREATEST(\`buyHigh\`, ?),
         \`buyLow\`=LEAST(\`buyLow\`, ?),
         \`buyClose\`=?,
         \`sellHigh\`=GREATEST(\`sellHigh\`, ?),
         \`sellLow\`=LEAST(\`sellLow\`, ?),
         \`sellClose\`=?,
         \`marketOpen\`=?,
         \`updatedAt\`=?`,
      [
        draft.pair,
        minute,
        draft.buy, draft.buy, draft.buy, draft.buy,
        draft.sell, draft.sell, draft.sell, draft.sell,
        draft.marketOpen ? 1 : 0,
        now,
        draft.buy, draft.buy, draft.buy,
        draft.sell, draft.sell, draft.sell,
        draft.marketOpen ? 1 : 0,
        now,
      ],
    );
  }
  return drafts.length;
}

async function oldestSample(pair: PricePair) {
  const row = await queryOne<{ minute: Date | string }>(
    "SELECT `minute` FROM `PriceBar` WHERE `pair`=? ORDER BY `minute` ASC LIMIT 1",
    [pair],
  );
  return asDate(row?.minute);
}

export async function ensureFreshSample(now = new Date()) {
  const snapshot = await fetchElizSnapshot(getElizXauUrl());
  await recordXauSamples(snapshot, now);
}

type BarRow = {
  minute: Date | string;
  buyOpen: string | number;
  buyHigh: string | number;
  buyLow: string | number;
  buyClose: string | number;
  sellOpen: string | number;
  sellHigh: string | number;
  sellLow: string | number;
  sellClose: string | number;
  marketOpen: unknown;
};

export async function loadPriceChart(input: {
  pair: string;
  range: string;
  side: string;
  frame?: string;
  now?: Date;
  live?: SampleDraft & { at: string | null };
  buyDelta?: number;
  sellDelta?: number;
}) {
  const frameValue = input.frame ?? "1M";
  if (!isPricePair(input.pair) || !isPriceRange(input.range) || !isPriceSide(input.side) || !isPriceFrame(frameValue)) {
    return { error: "Unknown price query." as const };
  }
  const pair: PricePair = input.pair;
  const range: PriceRangeId = input.range;
  const side: PriceSide = input.side;
  const frame: PriceFrameId = frameValue;
  const now = input.now ?? new Date();
  const ranges = visibleRanges(await oldestSample(pair), now);
  if (!ranges.includes(range)) return { error: "That range is not available yet." as const };

  const latest = await queryOne<BarRow>(
    `SELECT \`minute\`,\`buyOpen\`,\`buyHigh\`,\`buyLow\`,\`buyClose\`,
            \`sellOpen\`,\`sellHigh\`,\`sellLow\`,\`sellClose\`,\`marketOpen\`
     FROM \`PriceBar\` WHERE \`pair\`=? ORDER BY \`minute\` DESC LIMIT 1`,
    [pair],
  );
  const windowMs = rangeWindowMs(range) ?? 0;
  const since = new Date(now.getTime() - windowMs);
  const rows = await query<BarRow>(
    `SELECT \`minute\`,\`buyOpen\`,\`buyHigh\`,\`buyLow\`,\`buyClose\`,
            \`sellOpen\`,\`sellHigh\`,\`sellLow\`,\`sellClose\`,\`marketOpen\`
     FROM \`PriceBar\`
     WHERE \`pair\`=? AND \`minute\`>=?
     ORDER BY \`minute\` ASC`,
    [pair, since],
  );
  const buyDelta = input.buyDelta ?? 0;
  const sellDelta = input.sellDelta ?? 0;
  const quoteOf = (buy: number, sell: number) =>
    adjustedQuote({ pair, buy, sell, marketOpen: true }, buyDelta, sellDelta);
  const live = input.live ? adjustedQuote(input.live, buyDelta, sellDelta) : null;
  const header = live ?? (latest ? quoteOf(asNumber(latest.buyClose), asNumber(latest.sellClose)) : null);
  const sidePrice = (buy: number, sell: number) => {
    const quote = quoteOf(buy, sell);
    return side === "buy" ? quote.buy : quote.sell;
  };
  const bars: Candle[] = rows.map((row) => {
    const open = sidePrice(asNumber(row.buyOpen), asNumber(row.sellOpen));
    const high = sidePrice(asNumber(row.buyHigh), asNumber(row.sellHigh));
    const low = sidePrice(asNumber(row.buyLow), asNumber(row.sellLow));
    const close = sidePrice(asNumber(row.buyClose), asNumber(row.sellClose));
    return {
      at: asDate(row.minute) ?? now,
      open,
      high: Math.max(open, high, low, close),
      low: Math.min(open, high, low, close),
      close,
    };
  });
  const candles = aggregateCandles(bars, frame);

  return {
    chart: {
      pair,
      unit: pairUnit(pair),
      marketOpen: input.live ? input.live.marketOpen : latest ? asBool(latest.marketOpen) : false,
      sell: header ? formatSamplePrice(pair, header.sell) : null,
      buy: header ? formatSamplePrice(pair, header.buy) : null,
      side,
      range,
      frame,
      ranges,
      updatedAt: input.live?.at ?? (latest ? asDate(latest.minute)?.toISOString() ?? null : null),
      points: candles.map((candle) => ({
        at: candle.at.toISOString(),
        open: formatSamplePrice(pair, candle.open),
        high: formatSamplePrice(pair, candle.high),
        low: formatSamplePrice(pair, candle.low),
        close: formatSamplePrice(pair, candle.close),
      })),
    },
  };
}
