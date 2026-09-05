export const RATE_TIMEZONE = process.env.RATE_TIMEZONE ?? "Asia/Kuala_Lumpur";

const TIME_RE = /^(\d{1,2}):(\d{2})(?::\d{2})?$/;

export function normalizeClockTime(value: string): string | null {
  const match = value.trim().match(TIME_RE);
  if (!match) return null;
  const hour = Number(match[1]);
  const minute = Number(match[2]);
  if (hour > 23 || minute > 59) return null;
  return `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
}

export function getZonedNow(at = new Date(), timeZone = RATE_TIMEZONE) {
  const parts = Object.fromEntries(
    new Intl.DateTimeFormat("en-GB", {
      timeZone,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      hourCycle: "h23",
    })
      .formatToParts(at)
      .filter((part) => part.type !== "literal")
      .map((part) => [part.type, part.value]),
  );

  const date = `${parts.year}-${parts.month}-${parts.day}`;
  const time = `${parts.hour}:${parts.minute}`;
  return { date, time, slotKey: `${date}-${time}` };
}

export function formatInZone(
  value: Date,
  options: Intl.DateTimeFormatOptions = {
    dateStyle: "medium",
    timeStyle: "short",
  },
  timeZone = RATE_TIMEZONE,
) {
  return new Intl.DateTimeFormat("en-MY", { timeZone, ...options }).format(value);
}

export function formatRateStamp(value: Date, timeZone = RATE_TIMEZONE) {
  return new Intl.DateTimeFormat("en-GB", {
    timeZone,
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
    timeZoneName: "longOffset",
  })
    .format(value)
    .replace(",", "");
}

export function scheduleSlotKey(date: string, time: string) {
  return `${date}-${time}`;
}
