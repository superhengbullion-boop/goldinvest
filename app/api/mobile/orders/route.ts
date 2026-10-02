import { memberFromRequest, unauthorized } from "@/lib/mobile-auth";
import { getOrdersPageForMember, normalizeHistoryLimit } from "@/lib/orders";

export const dynamic = "force-dynamic";

function num(value: string | number) {
  return Number(value);
}

function iso(value: Date | string) {
  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? null : date.toISOString();
}

export async function GET(request: Request) {
  const member = await memberFromRequest(request);
  if (!member) return unauthorized();

  const url = new URL(request.url);
  const rawPage = Number(url.searchParams.get("page"));
  const page = Number.isFinite(rawPage) ? rawPage : 1;
  const result = await getOrdersPageForMember(member.id, {
    page,
    limit: normalizeHistoryLimit(url.searchParams.get("limit")),
  });

  return Response.json({
    total: result.total,
    page: result.page,
    pageCount: result.pageCount,
    pageSize: result.pageSize,
    orders: result.orders.map((order) => ({
      orderNo: order.orderNo,
      status: order.status,
      totalAmount: num(order.totalAmount),
      createdAt: iso(order.createdAt),
      items: order.items.map((item) => ({
        metal: item.metal,
        side: item.side,
        qtyKg: num(item.qtyKg),
        lockedPrice: num(item.lockedPrice),
        lineTotal: num(item.lineTotal),
      })),
    })),
  });
}
