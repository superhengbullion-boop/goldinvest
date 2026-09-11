import "server-only";
import { execute, newId } from "@/lib/db";
import {
  ELIZ_CURRENCY,
  fetchElizSnapshot,
  getElizXagUrl,
  getElizXauUrl,
  type ElizMarketSnapshot,
} from "@/lib/eliz-market";
import { RATE_TIMEZONE } from "@/lib/rate-time";

const ELIZ_METALS = [
  { metal: "XAU", url: getElizXauUrl },
  { metal: "XAG", url: getElizXagUrl },
] as const;

function num(value: string | undefined): number | null {
  if (value == null || value.trim() === "") return null;
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

export async function persistElizSnapshot(
  metal: string,
  snapshot: ElizMarketSnapshot,
  source: string,
) {
  const usdBuy = num(snapshot.price?.usd?.buy);
  const usdSell = num(snapshot.price?.usd?.sell);
  const myrBuy = num(snapshot.price?.myr?.buy);
  const myrSell = num(snapshot.price?.myr?.sell);
  const price =
    usdBuy != null && usdSell != null ? (usdBuy + usdSell) / 2 : usdBuy ?? usdSell ?? 0;
  const myrMid =
    myrBuy != null && myrSell != null ? (myrBuy + myrSell) / 2 : myrBuy ?? myrSell ?? null;

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
      newId(),
      metal,
      ELIZ_CURRENCY,
      `${metal}${ELIZ_CURRENCY}`,
      price,
      usdBuy,
      usdSell,
      "market_snapshot",
      myrMid != null ? myrMid / 1000 : null,
      myrMid,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      JSON.stringify(snapshot),
      source,
    ],
  );

  return { metal, currency: ELIZ_CURRENCY, price, source };
}

export async function refreshElizQuotes(source: string) {
  const results = [];
  const errors: string[] = [];
  const settled = await Promise.allSettled(
    ELIZ_METALS.map(({ url }) => fetchElizSnapshot(url())),
  );

  for (let i = 0; i < settled.length; i++) {
    const item = settled[i];
    const { metal } = ELIZ_METALS[i];
    if (item.status === "rejected") {
      const msg = item.reason instanceof Error ? item.reason.message : String(item.reason);
      errors.push(`Eliz ${metal}: ${msg}`);
      console.error(`[rates] ${msg}`);
      continue;
    }
    try {
      results.push(await persistElizSnapshot(metal, item.value, source));
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      errors.push(`Eliz ${metal}: ${msg}`);
      console.error(`[rates] ${msg}`);
    }
  }

  if (results.length === 0) {
    throw new Error(errors[0] ?? "Failed to refresh Eliz market snapshots.");
  }

  return { quotes: results, errors, timezone: RATE_TIMEZONE };
}
