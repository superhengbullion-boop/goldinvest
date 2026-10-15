import "server-only";
import { getElizSnapshots } from "@/lib/market-api";
import { recordXauSamples } from "@/lib/price-samples";

const TICK_MS = 20_000;

declare global {
  var __priceRecorderStarted: boolean | undefined;
}

async function recordLiveBar() {
  const { xau } = await getElizSnapshots();
  await recordXauSamples(xau);
}

export function startPriceRecorder() {
  if (globalThis.__priceRecorderStarted) return;
  globalThis.__priceRecorderStarted = true;
  console.log("[prices] Minute candle recorder started");
  void recordLiveBar().catch((err) => console.error("[prices] first bar failed:", err));
  setInterval(() => {
    void recordLiveBar().catch((err) => console.error("[prices] bar update failed:", err));
  }, TICK_MS);
}
