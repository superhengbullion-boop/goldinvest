import { assetsHubNotFound } from "@/lib/feature-flags";
import { getDepositSettings } from "@/lib/deposit-settings";
import { memberFromRequest, unauthorized } from "@/lib/mobile-auth";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const hidden = assetsHubNotFound();
  if (hidden) return hidden;
  const member = await memberFromRequest(request);
  if (!member) return unauthorized();
  const settings = await getDepositSettings();
  return Response.json(settings);
}
