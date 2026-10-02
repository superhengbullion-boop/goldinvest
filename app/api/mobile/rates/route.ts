import { buildMarketResponse, getElizSnapshots } from "@/lib/market-api";
import { getManualFxRates } from "@/lib/data";
import { memberFromRequest, unauthorized } from "@/lib/mobile-auth";
import type { RateAdj } from "@/lib/metal-quotes";

export const dynamic = "force-dynamic";

const noStore = { "Cache-Control": "no-store" };

function serializeAdjustments(
  adjustments: Array<{
    metal: string;
    unitKey: string;
    buyDelta: { toString(): string } | number;
    sellDelta: { toString(): string } | number;
  }>,
): RateAdj[] {
  return adjustments.map((item) => ({
    metal: item.metal,
    unitKey: item.unitKey,
    buyDelta: Number(item.buyDelta),
    sellDelta: Number(item.sellDelta),
  }));
}

export async function GET(request: Request) {
  const member = await memberFromRequest(request);
  if (!member) return unauthorized();

  const book = member.rateBook?.isActive ? member.rateBook : null;
  if (!book) {
    return Response.json(
      { assigned: false, board: { rows: [], updatedAt: null } },
      { headers: noStore },
    );
  }

  try {
    const [snapshots, manualFx] = await Promise.all([getElizSnapshots(), getManualFxRates()]);
    const market = buildMarketResponse(snapshots, serializeAdjustments(book.adjustments), true, manualFx);
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
