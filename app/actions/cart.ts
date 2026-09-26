"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getMember } from "@/lib/member-session";
import {
  removeCartItem,
  updateCartItemQty,
  upsertCartItem,
} from "@/lib/orders";

async function requireMember() {
  const member = await getMember();
  if (!member) redirect("/login?next=/portal/cart");
  return member;
}

export async function addToCart(formData: FormData) {
  const member = await requireMember();
  const metal = String(formData.get("metal") ?? "").trim().toUpperCase();
  const lockedSellPrice = Number(formData.get("lockedSellPrice"));
  const qtyKg = Number(formData.get("qtyKg"));

  if (metal !== "XAU" && metal !== "XAG") {
    throw new Error("Invalid metal.");
  }
  if (!Number.isFinite(lockedSellPrice) || lockedSellPrice <= 0) {
    throw new Error("Sell price is unavailable. Refresh rates and try again.");
  }
  if (!Number.isFinite(qtyKg) || qtyKg <= 0) {
    throw new Error("Enter a quantity greater than zero.");
  }

  await upsertCartItem({
    memberId: member.id,
    metal,
    lockedSellPrice,
    qtyKg,
  });

  revalidatePath("/portal/cart");
  revalidatePath("/", "layout");
  redirect("/portal/cart");
}

export async function updateCartQty(formData: FormData) {
  const member = await requireMember();
  const itemId = String(formData.get("itemId") ?? "").trim();
  const qtyKg = Number(formData.get("qtyKg"));
  if (!itemId) throw new Error("Missing cart item.");
  await updateCartItemQty(member.id, itemId, qtyKg);
  revalidatePath("/portal/cart");
  revalidatePath("/", "layout");
}

export async function removeFromCart(formData: FormData) {
  const member = await requireMember();
  const itemId = String(formData.get("itemId") ?? "").trim();
  if (!itemId) throw new Error("Missing cart item.");
  await removeCartItem(member.id, itemId);
  revalidatePath("/portal/cart");
  revalidatePath("/", "layout");
}
