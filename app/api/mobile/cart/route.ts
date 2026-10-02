import { badRequest, memberFromRequest, unauthorized } from "@/lib/mobile-auth";
import { readJsonObject, serializeCart } from "@/lib/mobile-cart";
import { getCartItems, upsertCartItem } from "@/lib/orders";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const member = await memberFromRequest(request);
  if (!member) return unauthorized();
  return Response.json(serializeCart(await getCartItems(member.id)));
}

export async function POST(request: Request) {
  const member = await memberFromRequest(request);
  if (!member) return unauthorized();

  const body = await readJsonObject(request);
  if (!body) return badRequest("Invalid metal.");

  const metal = String(body.metal ?? "").trim().toUpperCase();
  const rawSide = String(body.side ?? "").trim().toLowerCase();
  const lockedPrice = Number(body.lockedPrice);
  const qtyKg = body.qtyKg === undefined ? 1 : Number(body.qtyKg);

  if (metal !== "XAU" && metal !== "XAG") return badRequest("Invalid metal.");
  if (rawSide !== "buy" && rawSide !== "sell") return badRequest("Invalid side.");
  const side = rawSide === "sell" ? "sell" : "buy";
  if (side === "sell" && metal !== "XAU") {
    return badRequest("Sell is only available for Physical Gold 999 - MYR/KG.");
  }
  if (!Number.isFinite(lockedPrice) || lockedPrice <= 0) {
    return badRequest("Price is unavailable. Refresh rates and try again.");
  }
  if (!Number.isFinite(qtyKg) || qtyKg <= 0) {
    return badRequest("Enter a quantity greater than zero.");
  }

  try {
    await upsertCartItem({ memberId: member.id, metal, side, lockedPrice, qtyKg });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Could not add to cart.";
    return badRequest(message);
  }

  return Response.json(serializeCart(await getCartItems(member.id)));
}
