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

function num(value: { toString(): string } | number | null | undefined) {
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
  { key: "usd-oz", label: "USD/oz" },
  { key: "myr-kg", label: "MYR/kg" },
  { key: "myr-tael", label: "MYR/tael" },
  { key: "myr-g", label: "MYR/g" },
  { key: "usd-myr", label: "USD/MYR" },
] as const;

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

export function metalBoard(usd?: QuoteLike | null, myr?: QuoteLike | null): BoardRow[] {
  const rows: BoardRow[] = [];
  if (usd) {
    const oz = scale(usd, num(usd.price));
    if (oz) rows.push({ key: "usd-oz", label: "USD/oz", ...oz, digits: 2 });
  }
  if (myr) {
    const kg = scale(myr, num(myr.priceKg) ?? (num(myr.priceGram) != null ? num(myr.priceGram)! * 1000 : null));
    const tael = scale(myr, num(myr.priceTael));
    const gram = scale(myr, num(myr.priceGram));
    if (kg) rows.push({ key: "myr-kg", label: "MYR/kg", ...kg, digits: 0 });
    if (tael) rows.push({ key: "myr-tael", label: "MYR/tael", ...tael, digits: 0 });
    if (gram) rows.push({ key: "myr-g", label: "MYR/g", ...gram, digits: 2 });
  }
  if (usd && myr) {
    const fx = fxRow(usd, myr);
    if (fx) rows.push(fx);
  }
  return rows;
}

export function tickerItems(quotes: QuoteLike[], adjustments: RateAdj[] = []) {
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
