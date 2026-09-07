import { type NextRequest } from "next/server";
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
    const result = await runScheduledRateRefresh();
    return Response.json({ ok: true, ...result });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("[cron/rates] failed:", message);
    return Response.json({ ok: false, error: message }, { status: 500 });
  }
}
