import "server-only";
import { execute, newId } from "@/lib/db";
import { RATE_TIMEZONE } from "@/lib/rate-time";

const PAIRS = [
  ["XAU", "USD"], ["XAU", "MYR"], ["XAG", "USD"], ["XAG", "MYR"],
] as const;

export type GoldApiQuote = {
  timestamp: number; datetime: string; metal: string; currency: string;
  symbol: string; price: number; unit?: string;
  change?: number; change_percent?: number; ask?: number; bid?: number;
  price_per_unit?: { troy_ounce?: number; gram?: number; kilogram?: number; tael?: number };
  melt_price_per_gram?: Record<string, number>;
};

function token() {
  const v = process.env.GOLDAPI_TOKEN?.trim();
  if (!v) throw new Error("GOLDAPI_TOKEN is not set.");
  return v;
}

function baseUrl() {
  return (process.env.GOLDAPI_BASE_URL ?? "https://www.goldapi.io/api").replace(/\/$/, "");
}

export async function fetchGoldApiQuote(metal: string, currency: string): Promise<GoldApiQuote> {
  const res = await fetch(`${baseUrl()}/price/${metal}/${currency}`, {
    method: "GET",
    headers: { "x-access-token": token(), Accept: "application/json" },
    cache: "no-store",
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`GoldAPI ${metal}/${currency} failed (${res.status}): ${body.slice(0, 200)}`);
  }
  const data = (await res.json()) as GoldApiQuote & { error?: string };
  if (data.error) throw new Error(`GoldAPI ${metal}/${currency}: ${data.error}`);
  if (typeof data.price !== "number") throw new Error(`GoldAPI ${metal}/${currency} returned no price.`);
  return data;
}

export async function persistGoldApiQuote(data: GoldApiQuote, source: string) {
  const melt = data.melt_price_per_gram ?? {};
  const units = data.price_per_unit ?? {};
  const metal = data.metal.toUpperCase();
  const currency = data.currency.toUpperCase();
  await execute(
    `INSERT INTO \`MetalQuote\`
      (\`id\`,\`metal\`,\`currency\`,\`symbol\`,\`price\`,\`bid\`,\`ask\`,\`unit\`,
       \`priceGram\`,\`priceKg\`,\`priceTael\`,\`melt24k\`,\`melt22k\`,\`melt21k\`,\`melt18k\`,
       \`change\`,\`changePercent\`,\`raw\`,\`fetchedAt\`,\`source\`,\`createdAt\`,\`updatedAt\`)
     VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,NOW(3),?,NOW(3),NOW(3))
     ON DUPLICATE KEY UPDATE
      \`symbol\`=VALUES(\`symbol\`),\`price\`=VALUES(\`price\`),\`bid\`=VALUES(\`bid\`),
      \`ask\`=VALUES(\`ask\`),\`unit\`=VALUES(\`unit\`),\`priceGram\`=VALUES(\`priceGram\`),
      \`priceKg\`=VALUES(\`priceKg\`),\`priceTael\`=VALUES(\`priceTael\`),
      \`melt24k\`=VALUES(\`melt24k\`),\`melt22k\`=VALUES(\`melt22k\`),
      \`melt21k\`=VALUES(\`melt21k\`),\`melt18k\`=VALUES(\`melt18k\`),
      \`change\`=VALUES(\`change\`),\`changePercent\`=VALUES(\`changePercent\`),
      \`raw\`=VALUES(\`raw\`),\`fetchedAt\`=VALUES(\`fetchedAt\`),
      \`source\`=VALUES(\`source\`),\`updatedAt\`=NOW(3)`,
    [
      newId(), metal, currency, data.symbol, data.price,
      data.bid ?? null, data.ask ?? null, data.unit ?? "troy_ounce",
      units.gram ?? null, units.kilogram ?? null, units.tael ?? null,
      melt["24k"] ?? null, melt["22k"] ?? null, melt["21k"] ?? null, melt["18k"] ?? null,
      data.change ?? null, data.change_percent ?? null,
      JSON.stringify(data), source,
    ],
  );
  return { metal, currency, price: data.price, source };
}

export async function refreshMetalQuotes(source: string) {
  const results = [];
  const errors: string[] = [];
  const settled = await Promise.allSettled(
    PAIRS.map(([m, c]) => fetchGoldApiQuote(m, c)),
  );
  for (let i = 0; i < settled.length; i++) {
    const item = settled[i];
    const [metal, currency] = PAIRS[i];
    if (item.status === "rejected") {
      const msg = item.reason instanceof Error ? item.reason.message : String(item.reason);
      errors.push(msg); console.error(`[rates] ${msg}`);
    } else {
      try {
        results.push(await persistGoldApiQuote(item.value, source));
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        errors.push(`GoldAPI ${metal}/${currency}: ${msg}`);
        console.error(`[rates] ${msg}`);
      }
    }
  }
  if (results.length === 0) throw new Error(errors[0] ?? "Failed to refresh metal quotes.");
  return { quotes: results, errors, timezone: RATE_TIMEZONE };
}
