import { buildMarketResponse, getElizSnapshots } from "@/lib/market-api";
import { getMember } from "@/lib/member-session";
import type { RateAdj } from "@/lib/metal-quotes";

export const dynamic = "force-dynamic";

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

export async function GET() {
  try {
    const [member, snapshots] = await Promise.all([getMember(), getElizSnapshots()]);
    const book = member?.rateBook?.isActive ? member.rateBook : null;
    const adjustments = book ? serializeAdjustments(book.adjustments) : [];

    return Response.json(buildMarketResponse(snapshots, adjustments, Boolean(book)), {
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
        error: message,
      },
      { status: 502 },
    );
  }
}
