import type { ElizMarketSnapshot } from "@/lib/eliz-market";

export type QuoteLike = {
  metal: string;
  currency: string;
  price: { toString(): string } | number;
  bid: { toString(): string } | number | null;
  ask: { toString(): string } | number | null;
  priceGram: { toString(): string } | number | null;
  priceKg?: { toString(): string } | number | null;
  priceTael?: { toString(): string } | number | null;
  melt24k: { toString(): string } | number | null;
  melt22k: { toString(): string } | number | null;
  melt21k: { toString(): string } | number | null;
  melt18k: { toString(): string } | number | null;
  fetchedAt: Date;
};

export type BoardRow = {
  key: string;
  label: string;
  buy: number;
  sell: number;
  digits: number;
};

export function metalLabel(metal: string) {
  if (metal === "XAU") return "Gold";
  if (metal === "XAG") return "Silver";
  return metal;
}

function num(value: { toString(): string } | number | string | null | undefined) {
  if (value == null) return null;
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

function scale(quote: QuoteLike, unitPrice: number | null) {
  const price = num(quote.price);
  const bid = num(quote.bid) ?? price;
  const ask = num(quote.ask) ?? price;
  if (unitPrice == null || price == null || !price || bid == null || ask == null) return null;
  return {
    buy: (bid / price) * unitPrice,
    sell: (ask / price) * unitPrice,
  };
}

function fxRow(usd: QuoteLike, myr: QuoteLike): BoardRow | null {
  const usdBid = num(usd.bid) ?? num(usd.price);
  const usdAsk = num(usd.ask) ?? num(usd.price);
  const myrBid = num(myr.bid) ?? num(myr.price);
  const myrAsk = num(myr.ask) ?? num(myr.price);
  if (!usdBid || !usdAsk || !myrBid || !myrAsk) return null;
  return {
    key: "usd-myr",
    label: "USD/MYR",
    buy: myrBid / usdBid,
    sell: myrAsk / usdAsk,
    digits: 4,
  };
}

export const BOARD_UNITS = [
  { key: "usd-oz", label: "USD/OZ" },
  { key: "myr-kg", label: "MYR/KG" },
  { key: "usd-myr", label: "USD/MYR" },
] as const;

export const ELIZ_CURRENCY = "ELIZ";

export const RATE_METALS = [
  { key: "XAU", label: "Gold" },
  { key: "XAG", label: "Silver" },
] as const;

export type BoardUnitKey = (typeof BOARD_UNITS)[number]["key"];
export type RateMetalKey = (typeof RATE_METALS)[number]["key"];

export type RateAdj = {
  metal: string;
  unitKey: string;
  buyDelta: { toString(): string } | number;
  sellDelta: { toString(): string } | number;
};

export function defaultAdjustments() {
  return RATE_METALS.flatMap((metal) =>
    BOARD_UNITS.map((unit) => ({
      metal: metal.key,
      unitKey: unit.key,
      buyDelta: 0,
      sellDelta: 0,
    })),
  );
}

export function applyAdjustments(
  rows: BoardRow[],
  metal: string,
  adjustments: RateAdj[] = [],
): BoardRow[] {
  const byUnit = new Map(
    adjustments
      .filter((item) => item.metal === metal)
      .map((item) => [item.unitKey, item]),
  );

  return rows.map((row) => {
    const adj = byUnit.get(row.key);
    const buyDelta = adj ? Number(adj.buyDelta) : 0;
    const sellDelta = adj ? Number(adj.sellDelta) : 0;
    return {
      ...row,
      buy: Math.max(0, row.buy + (Number.isFinite(buyDelta) ? buyDelta : 0)),
      sell: Math.max(0, row.sell + (Number.isFinite(sellDelta) ? sellDelta : 0)),
    };
  });
}

export function adjLookup(adjustments: RateAdj[], metal: string, unitKey: string) {
  const match = adjustments.find((item) => item.metal === metal && item.unitKey === unitKey);
  return {
    buyDelta: match ? Number(match.buyDelta) : 0,
    sellDelta: match ? Number(match.sellDelta) : 0,
  };
}

function parseElizSnapshot(raw: unknown): ElizMarketSnapshot | null {
  if (raw == null) return null;
  try {
    const data = typeof raw === "string" ? JSON.parse(raw) : raw;
    if (typeof data !== "object" || data === null) return null;
    const snapshot = data as ElizMarketSnapshot;
    if (!snapshot.price?.usd || !snapshot.price?.myr) return null;
    return snapshot;
  } catch {
    return null;
  }
}

/** Public rates page rows: USD/OZ, MYR/KG, USD/MYR. */
export function elizSnapshotToBoardRows(snapshot: ElizMarketSnapshot): BoardRow[] {
  const rows: BoardRow[] = [];

  const usdBuy = num(snapshot.price?.usd?.buy);
  const usdSell = num(snapshot.price?.usd?.sell);
  if (usdBuy != null && usdSell != null) {
    rows.push({ key: "usd-oz", label: "USD/OZ", buy: usdBuy, sell: usdSell, digits: 2 });
  }

  const myrBuy = num(snapshot.price?.myr?.buy);
  const myrSell = num(snapshot.price?.myr?.sell);
  if (myrBuy != null && myrSell != null) {
    rows.push({ key: "myr-kg", label: "MYR/KG", buy: myrBuy, sell: myrSell, digits: 0 });
  }

  const fxBuy = num(snapshot.myrRate?.bidPrice);
  const fxSell = num(snapshot.myrRate?.askPrice);
  if (fxBuy != null && fxSell != null) {
    rows.push({ key: "usd-myr", label: "USD/MYR", buy: fxBuy, sell: fxSell, digits: 4 });
  }

  return rows;
}

export function elizSnapshotUpdatedAt(snapshot: ElizMarketSnapshot): Date | null {
  const raw = snapshot.price?.updatedAt ?? snapshot.myrRate?.updatedAt;
  if (!raw) return null;
  const date = new Date(raw);
  return Number.isNaN(date.getTime()) ? null : date;
}

export function elizBoardFromQuote(
  quotes: Array<{ metal: string; currency: string; raw?: unknown; fetchedAt: Date }>,
  metal: string,
): { rows: BoardRow[]; updatedAt: Date | null } {
  const row = quotes.find((quote) => quote.metal === metal && quote.currency === ELIZ_CURRENCY);
  if (!row) return { rows: [], updatedAt: null };
  const snapshot = parseElizSnapshot(row.raw);
  if (!snapshot) return { rows: [], updatedAt: row.fetchedAt };
  return {
    rows: elizSnapshotToBoardRows(snapshot),
    updatedAt: elizSnapshotUpdatedAt(snapshot) ?? row.fetchedAt,
  };
}

export function marketBoardForMetal(
  quotes: Array<QuoteLike & { raw?: unknown; currency: string; metal: string; fetchedAt: Date }>,
  metal: string,
): BoardRow[] {
  const eliz = elizBoardFromQuote(quotes, metal);
  if (eliz.rows.length > 0) return eliz.rows;

  return metalBoard(
    quotes.find((quote) => quote.metal === metal && quote.currency === "USD"),
    quotes.find((quote) => quote.metal === metal && quote.currency === "MYR"),
  );
}

export function metalBoard(usd?: QuoteLike | null, myr?: QuoteLike | null): BoardRow[] {
  const rows: BoardRow[] = [];
  if (usd) {
    const oz = scale(usd, num(usd.price));
    if (oz) rows.push({ key: "usd-oz", label: "USD/oz", ...oz, digits: 2 });
  }
  if (myr) {
    const kg = scale(myr, num(myr.priceKg) ?? (num(myr.priceGram) != null ? num(myr.priceGram)! * 1000 : null));
    if (kg) rows.push({ key: "myr-kg", label: "MYR/KG", ...kg, digits: 0 });
  }
  if (usd && myr) {
    const fx = fxRow(usd, myr);
    if (fx) rows.push({ ...fx, label: "USD/MYR" });
  }
  return rows;
}

export function tickerItems(
  quotes: Array<QuoteLike & { raw?: unknown; currency: string; metal: string; fetchedAt: Date }>,
  adjustments: RateAdj[] = [],
) {
  const hasEliz = quotes.some((quote) => quote.currency === ELIZ_CURRENCY);
  if (hasEliz) {
    return RATE_METALS.flatMap(({ key }) => {
      const { rows } = elizBoardFromQuote(quotes, key);
      const kg = rows.find((row) => row.key === "myr-kg");
      if (!kg) return [];
      const adj = adjLookup(adjustments, key, "myr-kg");
      return [
        {
          metal: metalLabel(key),
          product: "MYR/KG",
          buyPrice: Math.max(0, kg.buy + adj.buyDelta),
          sellPrice: Math.max(0, kg.sell + adj.sellDelta),
          currency: "MYR",
        },
      ];
    });
  }

  const preferred = quotes.filter((quote) => quote.currency === "MYR");
  const source = preferred.length > 0 ? preferred : quotes;
  return source
    .slice()
    .sort((a, b) => Number(b.metal === "XAU") - Number(a.metal === "XAU"))
    .flatMap((quote) => {
      const gram = scale(quote, num(quote.priceGram)) ?? scale(quote, num(quote.price));
      if (!gram) return [];
      const unitKey = quote.currency === "MYR" ? "myr-g" : "usd-oz";
      const adj = adjLookup(adjustments, quote.metal, unitKey);
      return [
        {
          metal: metalLabel(quote.metal),
          product: `${quote.currency}/g`,
          buyPrice: Math.max(0, gram.buy + adj.buyDelta),
          sellPrice: Math.max(0, gram.sell + adj.sellDelta),
          currency: quote.currency,
        },
      ];
    });
}
