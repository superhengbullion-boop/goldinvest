import { badRequest, memberFromRequest, unauthorized } from "@/lib/mobile-auth";
import { readJsonObject, serializeCart } from "@/lib/mobile-cart";
import { getCartItems, removeCartItem, updateCartItemQty } from "@/lib/orders";

export const dynamic = "force-dynamic";

async function ownItem(memberId: number, itemId: string) {
  const items = await getCartItems(memberId);
  return items.some((item) => item.id === itemId);
}

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const member = await memberFromRequest(request);
  if (!member) return unauthorized();

  const { id } = await context.params;
  const itemId = id.trim();
  if (!itemId || !(await ownItem(member.id, itemId))) {
    return Response.json({ error: "Cart item not found." }, { status: 404 });
  }

  const body = await readJsonObject(request);
  const qtyKg = Number(body?.qtyKg);
  if (!body || !Number.isFinite(qtyKg) || qtyKg <= 0) {
    return badRequest("Quantity must be greater than zero.");
  }

  try {
    await updateCartItemQty(member.id, itemId, qtyKg);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Could not update cart.";
    if (message === "Cart item not found.") {
      return Response.json({ error: message }, { status: 404 });
    }
    return badRequest(message);
  }

  return Response.json(serializeCart(await getCartItems(member.id)));
}

export async function DELETE(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const member = await memberFromRequest(request);
  if (!member) return unauthorized();

  const { id } = await context.params;
  const itemId = id.trim();
  if (!itemId || !(await ownItem(member.id, itemId))) {
    return Response.json({ error: "Cart item not found." }, { status: 404 });
  }

  await removeCartItem(member.id, itemId);
  return Response.json(serializeCart(await getCartItems(member.id)));
}
