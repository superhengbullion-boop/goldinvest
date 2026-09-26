export function lineTotalMyr(lockedSellPrice: number, qtyKg: number) {
  return Math.round(lockedSellPrice * qtyKg * 100) / 100;
}

export const HISTORY_PAGE_LIMITS = [10, 25, 50] as const;
export type HistoryPageLimit = (typeof HISTORY_PAGE_LIMITS)[number];

export function normalizeHistoryLimit(value: unknown): HistoryPageLimit {
  const n = Number(value);
  return (HISTORY_PAGE_LIMITS as readonly number[]).includes(n)
    ? (n as HistoryPageLimit)
    : 10;
}

export const ORDER_STATUSES = ["pending", "confirmed", "completed", "cancelled"] as const;
export type OrderStatus = (typeof ORDER_STATUSES)[number];
