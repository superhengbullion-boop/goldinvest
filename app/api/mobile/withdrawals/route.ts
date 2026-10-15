import { assetsHubNotFound } from "@/lib/feature-flags";
import { createWithdrawal } from "@/lib/wallet";
import { badRequest, memberFromRequest, unauthorized } from "@/lib/mobile-auth";
import { readJsonObject } from "@/lib/mobile-cart";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const hidden = assetsHubNotFound();
  if (hidden) return hidden;
  const member = await memberFromRequest(request);
  if (!member) return unauthorized();
  const body = await readJsonObject(request);
  if (!body) return badRequest("Enter an amount.");
  const kind = body.kind === "fund" ? "fund" : body.kind === "xau" ? "xau" : null;
  if (!kind) return badRequest("Choose gold or fund.");
  const amount = Number(body.amount);
  try {
    const row = await createWithdrawal(member.id, {
      kind,
      amount,
      bankAccountId: body.bankAccountId == null ? undefined : String(body.bankAccountId),
    });
    return Response.json(row);
  } catch (error) {
    return badRequest(error instanceof Error ? error.message : "Could not submit the withdrawal.");
  }
}
