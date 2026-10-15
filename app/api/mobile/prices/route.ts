import { assetsHubNotFound } from "@/lib/feature-flags";
import { getElizSnapshots } from "@/lib/market-api";
import { memberEffectiveAdjustments } from "@/lib/member-session";
import { badRequest, memberFromRequest, unauthorized } from "@/lib/mobile-auth";
import { adjLookup } from "@/lib/metal-quotes";
import { isPricePair, samplesFromSnapshot } from "@/lib/price-history";
import { loadPriceChart, recordXauSamples } from "@/lib/price-samples";
import { startPriceRecorder } from "@/lib/price-recorder";

export const dynamic = "force-dynamic";

const noStore = { "Cache-Control": "no-store" };

export async function GET(request: Request) {
  const hidden = assetsHubNotFound();
  if (hidden) return hidden;
  const member = await memberFromRequest(request);
  if (!member) return unauthorized();
  const url = new URL(request.url);
  startPriceRecorder();
  const pair = url.searchParams.get("pair") ?? "xau_myr";
  const range = url.searchParams.get("range") ?? "1D";
  const side = url.searchParams.get("side") ?? "buy";
  const frame = url.searchParams.get("frame") ?? "1M";
  if (!isPricePair(pair)) return badRequest("Unknown price query.");

  let live: Awaited<ReturnType<typeof samplesFromSnapshot>>[number] & { at: string | null } | undefined;
  let buyDelta = 0;
  let sellDelta = 0;
  try {
    const { xau } = await getElizSnapshots();
    await recordXauSamples(xau);
    const { adjustments } = memberEffectiveAdjustments(member.rateBook, member.adjustments ?? []);
    const unitKey = pair === "xau_myr" ? "myr-kg" : "usd-oz";
    const delta = adjLookup(adjustments, "XAU", unitKey);
    buyDelta = delta.buyDelta;
    sellDelta = delta.sellDelta;
    const draft = samplesFromSnapshot(xau).find((item) => item.pair === pair);
    if (draft) live = { ...draft, at: xau.price?.updatedAt ?? null };
  } catch (err) {
    console.error("[prices] live snapshot skipped:", err);
  }

  const result = await loadPriceChart({ pair, range, side, frame, live, buyDelta, sellDelta });
  if ("error" in result) return badRequest(result.error ?? "Unknown price query.");
  return Response.json(result.chart, { headers: noStore });
}
