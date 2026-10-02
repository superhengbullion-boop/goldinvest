import { badRequest, memberFromRequest, unauthorized } from "@/lib/mobile-auth";
import { placeOrder, summarizeOrderItems } from "@/lib/orders";
import { notifyWhatsAppOrder } from "@/lib/whatsapp";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const member = await memberFromRequest(request);
  if (!member) return unauthorized();

  try {
    const order = await placeOrder(member.id);
    try {
      await notifyWhatsAppOrder({
        orderNo: order.orderNo,
        totalAmount: order.totalAmount,
        metalSummary: summarizeOrderItems(order.items),
        member: {
          fullName: member.fullName,
          phone: member.phone,
          memberId: member.memberId,
        },
      });
    } catch (err) {
      console.error("[whatsapp] notify failed", err);
    }
    return Response.json({ orderNo: order.orderNo });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Could not place order.";
    return badRequest(message);
  }
}
