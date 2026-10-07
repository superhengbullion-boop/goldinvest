import { buildMarketResponse, getElizSnapshots } from "@/lib/market-api";
import { getManualFxRates } from "@/lib/data";
import { memberEffectiveAdjustments } from "@/lib/member-session";
import { memberFromRequest, unauthorized } from "@/lib/mobile-auth";

export const dynamic = "force-dynamic";

const noStore = { "Cache-Control": "no-store" };

export async function GET(request: Request) {
  const member = await memberFromRequest(request);
  if (!member) return unauthorized();

  const { adjustments, assigned } = memberEffectiveAdjustments(
    member.rateBook,
    member.adjustments ?? [],
  );
  if (!assigned) {
    return Response.json(
      { assigned: false, board: { rows: [], updatedAt: null } },
      { headers: noStore },
    );
  }

  try {
    const [snapshots, manualFx] = await Promise.all([getElizSnapshots(), getManualFxRates()]);
    const market = buildMarketResponse(snapshots, adjustments, true, manualFx);
    return Response.json(
      { assigned: true, board: market.board },
      { headers: noStore },
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unable to load market rates.";
    console.error("[api/mobile/rates]", message);
    return Response.json(
      { assigned: true, board: { rows: [], updatedAt: null }, error: message },
      { status: 502, headers: noStore },
    );
  }
}
