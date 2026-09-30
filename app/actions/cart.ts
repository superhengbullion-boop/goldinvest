"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getMember } from "@/lib/member-session";
import {
  normalizeTradeSide,
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
  const side = normalizeTradeSide(formData.get("side"));
  const lockedPrice = Number(formData.get("lockedPrice"));
  const qtyKg = Number(formData.get("qtyKg"));

  if (metal !== "XAU" && metal !== "XAG") {
    throw new Error("Invalid metal.");
  }
  if (side === "sell" && metal !== "XAU") {
    throw new Error("Sell is only available for Physical Gold 999 - MYR/KG.");
  }
  if (!Number.isFinite(lockedPrice) || lockedPrice <= 0) {
    throw new Error("Price is unavailable. Refresh rates and try again.");
  }
  if (!Number.isFinite(qtyKg) || qtyKg <= 0) {
    throw new Error("Enter a quantity greater than zero.");
  }

  await upsertCartItem({
    memberId: member.id,
    metal,
    side,
    lockedPrice,
    qtyKg,
  });

  revalidatePath("/portal/cart");
  revalidatePath("/", "layout");
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
