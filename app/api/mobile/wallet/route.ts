import { assetsHubNotFound } from "@/lib/feature-flags";
import { listWallet } from "@/lib/wallet";
import { badRequest, memberFromRequest, unauthorized } from "@/lib/mobile-auth";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const hidden = assetsHubNotFound();
  if (hidden) return hidden;
  const member = await memberFromRequest(request);
  if (!member) return unauthorized();
  const url = new URL(request.url);
  const asset = url.searchParams.get("asset");
  if (asset !== "xau" && asset !== "fund") return badRequest("Choose gold or fund.");
  const rows = await listWallet(member.id, asset, {
    method: url.searchParams.get("method") ?? "",
    status: url.searchParams.get("status") ?? "",
    from: url.searchParams.get("from") ?? "",
    to: url.searchParams.get("to") ?? "",
  });
  return Response.json({ rows });
}
