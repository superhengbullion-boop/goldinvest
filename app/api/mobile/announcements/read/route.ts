import { assetsHubNotFound } from "@/lib/feature-flags";
import { markAnnouncementRead } from "@/lib/wallet";
import { badRequest, memberFromRequest, unauthorized } from "@/lib/mobile-auth";
import { readJsonObject } from "@/lib/mobile-cart";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const hidden = assetsHubNotFound();
  if (hidden) return hidden;
  const member = await memberFromRequest(request);
  if (!member) return unauthorized();
  const body = await readJsonObject(request);
  const id = String(body?.id ?? "").trim();
  if (!id) return badRequest("Missing announcement.");
  try {
    await markAnnouncementRead(member.id, id);
    return Response.json({ ok: true });
  } catch (error) {
    return badRequest(error instanceof Error ? error.message : "Could not mark the announcement as read.");
  }
}
