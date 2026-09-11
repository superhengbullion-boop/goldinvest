import { type NextRequest } from "next/server";
import { refreshElizQuotes } from "@/lib/eliz-sync";
import { runScheduledRateRefresh } from "@/lib/rate-scheduler";

export const dynamic = "force-dynamic";

/**
 * Called by cPanel cron every 5 minutes:
 *   curl -s "https://superhengbullion.com.my/api/cron/rates?token=CRON_SECRET" > /dev/null
 *
 * Set CRON_SECRET in cPanel Node.js App → Environment Variables.
 */
export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get("token");
  const secret = process.env.CRON_SECRET;

  if (!secret) {
    return Response.json({ error: "CRON_SECRET env var not set" }, { status: 500 });
  }
  if (token !== secret) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const [eliz, schedule] = await Promise.allSettled([
      refreshElizQuotes("cron"),
      runScheduledRateRefresh(),
    ]);
    const elizError =
      eliz.status === "rejected"
        ? eliz.reason instanceof Error
          ? eliz.reason.message
          : String(eliz.reason)
        : null;
    const scheduleError =
      schedule.status === "rejected"
        ? schedule.reason instanceof Error
          ? schedule.reason.message
          : String(schedule.reason)
        : null;

    if (elizError && scheduleError) {
      throw new Error(elizError || scheduleError || "Rate refresh failed");
    }

    const elizResult = eliz.status === "fulfilled" ? eliz.value : { error: elizError };
    const scheduleResult = schedule.status === "fulfilled" ? schedule.value : { error: scheduleError };

    return Response.json({ ok: true, eliz: elizResult, schedule: scheduleResult });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("[cron/rates] failed:", message);
    return Response.json({ ok: false, error: message }, { status: 500 });
  }
}
