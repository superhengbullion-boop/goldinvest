import "server-only";
import { execute, query, queryOne } from "@/lib/db";
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
    const slots = await query<{ time: string }>("SELECT `time` FROM `RateRefreshTime`");
    const match = slots.find((s) => s.time === time);
    if (!match) return { skipped: true as const };
    const slotKey = scheduleSlotKey(date, match.time);
    const existing = await queryOne<{ ok: unknown }>(
      "SELECT `ok` FROM `RateFetchLog` WHERE `slotKey`=? LIMIT 1", [slotKey],
    );
    if (existing?.ok) return { skipped: true as const };
    const source = `schedule:${match.time}`;
    try {
      await refreshMetalQuotes(source);
      await execute(
        `INSERT INTO \`RateFetchLog\`(\`slotKey\`,\`fetchedAt\`,\`source\`,\`ok\`,\`error\`)
         VALUES(?,NOW(3),?,1,NULL)
         ON DUPLICATE KEY UPDATE \`fetchedAt\`=NOW(3),\`source\`=VALUES(\`source\`),\`ok\`=1,\`error\`=NULL`,
        [slotKey, source],
      );
      console.log(`[rates] Refreshed GoldAPI quotes for ${slotKey} (${RATE_TIMEZONE})`);
      return { skipped: false as const, slotKey };
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      await execute(
        `INSERT INTO \`RateFetchLog\`(\`slotKey\`,\`fetchedAt\`,\`source\`,\`ok\`,\`error\`)
         VALUES(?,NOW(3),?,0,?)
         ON DUPLICATE KEY UPDATE \`fetchedAt\`=NOW(3),\`source\`=VALUES(\`source\`),\`ok\`=0,\`error\`=VALUES(\`error\`)`,
        [slotKey, source, msg],
      );
      throw e;
    }
  } finally {
    globalThis.__rateSchedulerBusy = false;
  }
}

export function startRateScheduler() {
  if (globalThis.__rateSchedulerStarted) return;
  globalThis.__rateSchedulerStarted = true;
  console.log(`[rates] Scheduler started (${RATE_TIMEZONE}), polling every ${POLL_MS / 1000}s`);
  void runScheduledRateRefresh().catch((e) => console.error("[rates] Initial check failed:", e));
  setInterval(() => {
    void runScheduledRateRefresh().catch((e) => console.error("[rates] Scheduled refresh failed:", e));
  }, POLL_MS);
}
