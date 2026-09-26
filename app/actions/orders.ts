"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getMember } from "@/lib/member-session";
import { getSession } from "@/lib/session";
import {
  ORDER_STATUSES,
  placeOrder,
  summarizeOrderItems,
  type OrderStatus,
  updateOrderStatus,
} from "@/lib/orders";
import { notifyWhatsAppOrder } from "@/lib/whatsapp";

async function requireAdmin() {
  const session = await getSession();
  if (!session?.userId) throw new Error("Unauthorized");
}

export async function placeCartOrder() {
  const member = await getMember();
  if (!member) redirect("/login?next=/portal/cart");

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

  revalidatePath("/portal/cart");
  revalidatePath("/portal");
  revalidatePath("/portal/history");
  revalidatePath("/admin/orders");
  revalidatePath("/admin", "layout");
  revalidatePath("/", "layout");
  redirect(`/portal/cart?placed=${encodeURIComponent(order.orderNo)}`);
}

export async function setOrderStatus(formData: FormData) {
  await requireAdmin();
  const orderId = String(formData.get("orderId") ?? "").trim();
  const status = String(formData.get("status") ?? "").trim() as OrderStatus;
  if (!orderId) throw new Error("Missing order.");
  if (!ORDER_STATUSES.includes(status)) throw new Error("Invalid status.");
  await updateOrderStatus(orderId, status);
  revalidatePath("/admin/orders", "page");
  revalidatePath("/admin", "layout");
  revalidatePath("/portal");
  revalidatePath("/portal/history");
}
