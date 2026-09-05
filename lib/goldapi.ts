import { Prisma } from "@/app/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { RATE_TIMEZONE } from "@/lib/rate-time";

const PAIRS = [
  ["XAU", "USD"],
  ["XAU", "MYR"],
  ["XAG", "USD"],
  ["XAG", "MYR"],
] as const;

export type GoldApiQuote = {
  timestamp: number;
  datetime: string;
  metal: string;
  currency: string;
  symbol: string;
  price: number;
  unit?: string;
  change?: number;
  change_percent?: number;
  ask?: number;
  bid?: number;
  price_per_unit?: {
    troy_ounce?: number;
    gram?: number;
    kilogram?: number;
    tael?: number;
  };
  melt_price_per_gram?: Record<string, number>;
};

function token() {
  const value = process.env.GOLDAPI_TOKEN?.trim();
  if (!value) {
    throw new Error("GOLDAPI_TOKEN is not set.");
  }
  return value;
}

function baseUrl() {
  return (process.env.GOLDAPI_BASE_URL ?? "https://www.goldapi.io/api").replace(/\/$/, "");
}

function decimal(value: number | undefined | null) {
  if (value == null || Number.isNaN(value)) return null;
  return new Prisma.Decimal(value);
}

export async function fetchGoldApiQuote(metal: string, currency: string): Promise<GoldApiQuote> {
  const response = await fetch(`${baseUrl()}/price/${metal}/${currency}`, {
    method: "GET",
    headers: {
      "x-access-token": token(),
      Accept: "application/json",
    },
    cache: "no-store",
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`GoldAPI ${metal}/${currency} failed (${response.status}): ${body.slice(0, 200)}`);
  }

  const data = (await response.json()) as GoldApiQuote & { error?: string };
  if (data.error) {
    throw new Error(`GoldAPI ${metal}/${currency}: ${data.error}`);
  }
  if (typeof data.price !== "number") {
    throw new Error(`GoldAPI ${metal}/${currency} returned no price.`);
  }
  return data;
}

export async function persistGoldApiQuote(data: GoldApiQuote, source: string) {
  const melt = data.melt_price_per_gram ?? {};
  const units = data.price_per_unit ?? {};
  const metal = data.metal.toUpperCase();
  const currency = data.currency.toUpperCase();
  const payload = {
    symbol: data.symbol,
    price: data.price,
    bid: decimal(data.bid),
    ask: decimal(data.ask),
    unit: data.unit ?? "troy_ounce",
    priceGram: decimal(units.gram),
    priceKg: decimal(units.kilogram),
    priceTael: decimal(units.tael),
    melt24k: decimal(melt["24k"]),
    melt22k: decimal(melt["22k"]),
    melt21k: decimal(melt["21k"]),
    melt18k: decimal(melt["18k"]),
    change: decimal(data.change),
    changePercent: decimal(data.change_percent),
    raw: data as object,
    fetchedAt: new Date(),
    source,
  };

  return prisma.metalQuote.upsert({
    where: { metal_currency: { metal, currency } },
    create: { metal, currency, ...payload },
    update: payload,
  });
}

export async function refreshMetalQuotes(source: string) {
  const results = [];
  const errors: string[] = [];

  const settled = await Promise.allSettled(
    PAIRS.map(([metal, currency]) => fetchGoldApiQuote(metal, currency)),
  );

  for (let i = 0; i < settled.length; i += 1) {
    const item = settled[i];
    const [metal, currency] = PAIRS[i];
    if (item.status === "rejected") {
      const message = item.reason instanceof Error ? item.reason.message : String(item.reason);
      errors.push(message);
      console.error(`[rates] ${message}`);
      continue;
    }
    try {
      results.push(await persistGoldApiQuote(item.value, source));
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      errors.push(`GoldAPI ${metal}/${currency}: ${message}`);
      console.error(`[rates] ${message}`);
    }
  }

  if (results.length === 0) {
    throw new Error(errors[0] ?? "Failed to refresh metal quotes.");
  }

  return { quotes: results, errors, timezone: RATE_TIMEZONE };
}
