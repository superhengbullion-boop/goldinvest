import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  adjustedQuote,
  aggregateCandles,
  barMinute,
  myrPerGram,
  samplesFromSnapshot,
  shouldStoreSample,
  visibleRanges,
} from "@/lib/price-history";
import type { ElizMarketSnapshot } from "@/lib/eliz-market";

const now = new Date("2026-10-15T06:00:00.000Z");

function snapshot(myrBuy = "538409", myrSell = "543975"): ElizMarketSnapshot {
  return {
    price: {
      usd: { buy: "4132.26", sell: "4135.18", available: true },
      myr: { buy: myrBuy, sell: myrSell, available: true },
      updatedAt: now.toISOString(),
    },
    myrRate: {
      askPrice: "4.08",
      bidPrice: "4.06",
      highPrice: "0",
      lowPrice: "0",
      updatedAt: now.toISOString(),
      source: "test",
    },
  };
}

describe("myrPerGram", () => {
  it("converts a kilogram price to grams", () => {
    assert.equal(myrPerGram(538409), 538.409);
  });
});

describe("shouldStoreSample", () => {
  it("skips a snapshot inside 15 minutes", () => {
    const last = new Date(now.getTime() - 60 * 1000);
    assert.equal(shouldStoreSample(last, now), false);
  });

  it("stores a snapshot once 15 minutes have passed", () => {
    const last = new Date(now.getTime() - 15 * 60 * 1000);
    assert.equal(shouldStoreSample(last, now), true);
    assert.equal(shouldStoreSample(null, now), true);
  });
});

describe("visibleRanges", () => {
  it("shows 1D and 5D when the oldest sample is 6 days old", () => {
    const oldest = new Date(now.getTime() - 6 * 24 * 60 * 60 * 1000);
    assert.deepEqual(visibleRanges(oldest, now), ["1D", "5D"]);
  });

  it("shows only 1D when the oldest sample is 2 days old", () => {
    const oldest = new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000);
    assert.deepEqual(visibleRanges(oldest, now), ["1D"]);
  });
});

describe("minute candles", () => {
  it("keeps one bar per minute and builds a 15 minute candle from them", () => {
    const first = barMinute(new Date("2026-10-15T07:00:20.000Z"));
    const second = barMinute(new Date("2026-10-15T07:00:50.000Z"));
    assert.equal(first.toISOString(), second.toISOString());
    const bars = [
      { at: new Date("2026-10-15T07:00:00.000Z"), open: 10, high: 12, low: 9, close: 11 },
      { at: new Date("2026-10-15T07:14:00.000Z"), open: 11, high: 14, low: 11, close: 13 },
      { at: new Date("2026-10-15T07:15:00.000Z"), open: 13, high: 13, low: 8, close: 9 },
    ];
    const candles = aggregateCandles(bars, "15M");
    assert.equal(candles.length, 2);
    assert.equal(candles[0].open, 10);
    assert.equal(candles[0].high, 14);
    assert.equal(candles[0].low, 9);
    assert.equal(candles[0].close, 13);
    assert.equal(candles[1].open, 13);
    assert.equal(candles[1].close, 9);
  });
});

describe("adjustedQuote", () => {
  it("applies the web rate-book delta per kilogram for MYR", () => {
    const quote = adjustedQuote(
      { pair: "xau_myr", buy: 543.975, sell: 538.409, marketOpen: true },
      1000,
      2000,
    );
    assert.equal(quote.sell, 539.409);
    assert.equal(quote.buy, 545.975);
  });
});

describe("samplesFromSnapshot", () => {
  it("stores MYR per gram and USD per ounce", () => {
    const [myr, usd] = samplesFromSnapshot(snapshot());
    assert.equal(myr.pair, "xau_myr");
    assert.equal(myr.sell, 538.409);
    assert.equal(myr.buy, 543.975);
    assert.equal(usd.pair, "xau_usd");
    assert.equal(usd.sell, 4132.26);
    assert.equal(usd.buy, 4135.18);
  });
});
