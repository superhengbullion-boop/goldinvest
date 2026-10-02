import "server-only";
import { lineTotalMyr } from "@/lib/order-math";
import type { CartItemRow } from "@/lib/orders";

export function serializeCart(items: CartItemRow[]) {
  const lines = items.map((item) => {
    const lockedPrice = Number(item.lockedPrice);
    const qtyKg = Number(item.qtyKg);
    return {
      id: item.id,
      metal: item.metal,
      side: item.side,
      lockedPrice,
      qtyKg,
      lineTotal: lineTotalMyr(lockedPrice, qtyKg),
    };
  });
  const grandTotal = Math.round(lines.reduce((sum, line) => sum + line.lineTotal, 0) * 100) / 100;
  return { items: lines, grandTotal };
}

export async function readJsonObject(request: Request) {
  try {
    const body = await request.json();
    if (!body || typeof body !== "object" || Array.isArray(body)) return null;
    return body as Record<string, unknown>;
  } catch {
    return null;
  }
}
