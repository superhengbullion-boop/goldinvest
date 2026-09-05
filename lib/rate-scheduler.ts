import "server-only";

import { prisma } from "@/lib/prisma";
import { refreshMetalQuotes } from "@/lib/goldapi";
import { getZonedNow, RATE_TIMEZONE, scheduleSlotKey } from "@/lib/rate-time";

const POLL_MS = 20_000;

declare global {
  var __rateSchedulerStarted: boolean | undefined;
  var __rateSchedulerBusy: boolean | undefined;
}

export async function runScheduledRateRefresh(at = new Date()) {
  if (globalThis.__rateSchedulerBusy) return { skipped: true as const };
  globalThis.__rateSchedulerBusy = true;

  try {
    const { date, time } = getZonedNow(at);
    const slots = await prisma.rateRefreshTime.findMany({ select: { time: true } });
    const match = slots.find((slot) => slot.time === time);
    if (!match) return { skipped: true as const };

    const slotKey = scheduleSlotKey(date, match.time);
    const existing = await prisma.rateFetchLog.findUnique({ where: { slotKey } });
    if (existing?.ok) return { skipped: true as const };

    const source = `schedule:${match.time}`;
    try {
      await refreshMetalQuotes(source);
      await prisma.rateFetchLog.upsert({
        where: { slotKey },
        create: { slotKey, fetchedAt: new Date(), source, ok: true },
        update: { fetchedAt: new Date(), source, ok: true, error: null },
      });
      console.log(`[rates] Refreshed GoldAPI quotes for ${slotKey} (${RATE_TIMEZONE})`);
      return { skipped: false as const, slotKey };
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      await prisma.rateFetchLog.upsert({
        where: { slotKey },
        create: { slotKey, fetchedAt: new Date(), source, ok: false, error: message },
        update: { fetchedAt: new Date(), source, ok: false, error: message },
      });
      throw error;
    }
  } finally {
    globalThis.__rateSchedulerBusy = false;
  }
}

export function startRateScheduler() {
  if (globalThis.__rateSchedulerStarted) return;
  globalThis.__rateSchedulerStarted = true;

  console.log(`[rates] Scheduler started (${RATE_TIMEZONE}), polling every ${POLL_MS / 1000}s`);
  void runScheduledRateRefresh().catch((error) => {
    console.error("[rates] Initial schedule check failed:", error);
  });

  setInterval(() => {
    void runScheduledRateRefresh().catch((error) => {
      console.error("[rates] Scheduled refresh failed:", error);
    });
  }, POLL_MS);
}
