import "server-only";
import {
  fetchElizSnapshot,
  getElizXagUrl,
  getElizXauUrl,
  type ElizMarketSnapshot,
} from "@/lib/eliz-market";
import type { MarketApiResponse, MarketMetalPayload, MarketTickerItem } from "@/lib/market-types";
import {
  applyAdjustments,
  elizSnapshotToBoardRows,
  elizSnapshotUpdatedAt,
  type RateAdj,
} from "@/lib/metal-quotes";

type ElizSnapshots = { xau: ElizMarketSnapshot; xag: ElizMarketSnapshot };

let inflight: Promise<ElizSnapshots> | null = null;

function metalPayload(
  snapshot: ElizMarketSnapshot,
  metal: string,
  adjustments: RateAdj[],
): MarketMetalPayload {
  const updatedAt = elizSnapshotUpdatedAt(snapshot);
  return {
    rows: applyAdjustments(elizSnapshotToBoardRows(snapshot), metal, adjustments),
    updatedAt: updatedAt?.toISOString() ?? null,
  };
}

function tickerFromBoard(
  rows: MarketMetalPayload["rows"],
  metal: string,
  product: string,
): MarketTickerItem | null {
  const kg = rows.find((row) => row.key === "myr-kg");
  if (!kg) return null;
  return {
    metal: metal === "XAU" ? "Gold" : "Silver",
    product,
    buyPrice: kg.buy,
    sellPrice: kg.sell,
    currency: "MYR",
  };
}

function buildResponse(
  snapshots: { xau: ElizMarketSnapshot; xag: ElizMarketSnapshot },
  adjustments: RateAdj[],
  assigned: boolean,
): MarketApiResponse {
  const goldAdj = adjustments.filter((item) => item.metal === "XAU");
  const silverAdj = adjustments.filter((item) => item.metal === "XAG");
  const gold = metalPayload(snapshots.xau, "XAU", goldAdj);
  const silver = metalPayload(snapshots.xag, "XAG", silverAdj);

  const ticker = assigned
    ? ([
        tickerFromBoard(gold.rows, "XAU", "MYR/KG"),
        tickerFromBoard(silver.rows, "XAG", "MYR/KG"),
      ].filter(Boolean) as MarketTickerItem[])
    : [];

  return { ok: true, assigned, ticker, gold, silver };
}

export async function getElizSnapshots(): Promise<ElizSnapshots> {
  if (inflight) return inflight;

  inflight = Promise.all([
    fetchElizSnapshot(getElizXauUrl()),
    fetchElizSnapshot(getElizXagUrl()),
  ])
    .then(([xau, xag]) => ({ xau, xag }))
    .finally(() => {
      inflight = null;
    });

  return inflight;
}

export function buildMarketResponse(
  snapshots: ElizSnapshots,
  adjustments: RateAdj[] = [],
  assigned = true,
): MarketApiResponse {
  return buildResponse(snapshots, adjustments, assigned);
}

export async function getLiveMarket(
  _source: string,
  adjustments: RateAdj[] = [],
  assigned = true,
): Promise<MarketApiResponse> {
  const snapshots = await getElizSnapshots();
  return buildMarketResponse(snapshots, adjustments, assigned);
}
