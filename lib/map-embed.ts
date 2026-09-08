const ADDRESS_QUERY =
  "No 7, Jalan PPU 2A, Taman Perindustrian Puchong Utama, 47100 Puchong, Selangor";

export const DEFAULT_MAP_EMBED_URL = `https://maps.google.com/maps?q=${encodeURIComponent(ADDRESS_QUERY)}&hl=en&z=16&output=embed`;

function isAllowedGoogleMapsUrl(url: URL): boolean {
  const host = url.hostname.toLowerCase();
  const isGoogle =
    host === "google.com" ||
    host === "www.google.com" ||
    host === "maps.google.com" ||
    host.endsWith(".google.com");

  if (!isGoogle) return false;

  const path = url.pathname.toLowerCase();
  if (path.startsWith("/maps/embed")) return true;
  if (path.includes("/maps") && url.searchParams.get("output") === "embed") return true;

  return false;
}

/** Accept embed URL or pasted iframe HTML; return a safe Google Maps embed URL. */
export function normalizeMapEmbedUrl(input: string): string | null {
  const trimmed = input.trim();
  if (!trimmed) return null;

  const iframeMatch = trimmed.match(/<iframe[^>]+src=["']([^"']+)["']/i);
  const candidate = (iframeMatch?.[1] ?? trimmed).trim();

  try {
    const url = new URL(candidate);
    if (url.protocol !== "https:") return null;
    if (!isAllowedGoogleMapsUrl(url)) return null;
    return url.toString();
  } catch {
    return null;
  }
}

export function resolveMapEmbedUrl(value: string | undefined): string {
  return normalizeMapEmbedUrl(value ?? "") ?? DEFAULT_MAP_EMBED_URL;
}
