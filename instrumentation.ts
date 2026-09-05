export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    const { startRateScheduler } = await import("./lib/rate-scheduler");
    startRateScheduler();
  }
}
