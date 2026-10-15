import { assetsHubNotFound } from "@/lib/feature-flags";
import { createTransfer } from "@/lib/wallet";
import { badRequest, memberFromRequest, unauthorized } from "@/lib/mobile-auth";
import { readJsonObject } from "@/lib/mobile-cart";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const hidden = assetsHubNotFound();
  if (hidden) return hidden;
  const member = await memberFromRequest(request);
  if (!member) return unauthorized();
  const body = await readJsonObject(request);
  if (!body) return badRequest("Enter a username.");
  try {
    const row = await createTransfer(member.id, String(body.username ?? ""), Number(body.grams));
    return Response.json(row);
  } catch (error) {
    return badRequest(error instanceof Error ? error.message : "Could not submit the transfer.");
  }
}
