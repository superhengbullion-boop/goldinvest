import { assetsHubNotFound } from "@/lib/feature-flags";
import { listMemberAnnouncements } from "@/lib/wallet";
import { memberFromRequest, unauthorized } from "@/lib/mobile-auth";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const hidden = assetsHubNotFound();
  if (hidden) return hidden;
  const member = await memberFromRequest(request);
  if (!member) return unauthorized();
  const feed = await listMemberAnnouncements(member.id);
  return Response.json(feed);
}
