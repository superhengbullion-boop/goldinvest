import { assetsHubNotFound } from "@/lib/feature-flags";
import { memberFromRequest, unauthorized } from "@/lib/mobile-auth";

export const dynamic = "force-dynamic";

function amount(value: unknown) {
  const next = Number(value);
  return Number.isFinite(next) ? next : 0;
}

export async function GET(request: Request) {
  const hidden = assetsHubNotFound();
  if (hidden) return hidden;
  const member = await memberFromRequest(request);
  if (!member) return unauthorized();
  return Response.json({
    xauGrams: amount(member.xauGrams),
    fundMyr: amount(member.fundMyr),
    tradingLimitMyr: amount(member.tradingLimitMyr),
  });
}
