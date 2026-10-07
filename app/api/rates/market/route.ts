import { buildMarketResponse, getElizSnapshots } from "@/lib/market-api";
import { getManualFxRates } from "@/lib/data";
import { getMember, memberEffectiveAdjustments } from "@/lib/member-session";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const [member, snapshots, manualFx] = await Promise.all([
      getMember(),
      getElizSnapshots(),
      getManualFxRates(),
    ]);
    const { adjustments, assigned } = memberEffectiveAdjustments(
      member?.rateBook,
      member?.adjustments ?? [],
    );

    return Response.json(buildMarketResponse(snapshots, adjustments, assigned, manualFx), {
      headers: { "Cache-Control": "no-store" },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unable to load market rates.";
    console.error("[api/rates/market]", message);
    return Response.json(
      {
        ok: false,
        assigned: false,
        ticker: [],
        gold: { rows: [], updatedAt: null },
        silver: { rows: [], updatedAt: null },
        board: { rows: [], updatedAt: null },
        error: message,
      },
      { status: 502 },
    );
  }
}
