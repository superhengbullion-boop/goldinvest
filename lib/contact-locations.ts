import { DEFAULT_MAP_EMBED_URL, normalizeMapEmbedUrl, resolveMapEmbedUrl } from "@/lib/map-embed";
import type { ContactContent, ContactLocation } from "@/lib/types";

function cleanLocation(raw: Partial<ContactLocation>): ContactLocation | null {
  const name = String(raw.name ?? "").trim();
  const address = String(raw.address ?? "").trim();
  const mapEmbedUrl =
    normalizeMapEmbedUrl(String(raw.mapEmbedUrl ?? "")) ?? DEFAULT_MAP_EMBED_URL;

  if (!name && !address && !raw.mapEmbedUrl) return null;

  return {
    name: name || "Location",
    address,
    mapEmbedUrl,
  };
}

export function resolveContactLocations(content: ContactContent): ContactLocation[] {
  if (Array.isArray(content.locations) && content.locations.length > 0) {
    const locations = content.locations
      .map((item) => cleanLocation(item))
      .filter((item): item is ContactLocation => item !== null);
    if (locations.length > 0) return locations;
  }

  if (content.mapEmbedUrl?.trim()) {
    return [
      {
        name: "Main office",
        address: content.address?.trim() ?? "",
        mapEmbedUrl: resolveMapEmbedUrl(content.mapEmbedUrl),
      },
    ];
  }

  return [
    {
      name: "Puchong Office",
      address: content.address?.trim() ?? "",
      mapEmbedUrl: DEFAULT_MAP_EMBED_URL,
    },
  ];
}

/** Migrate legacy single map field into editable locations list. */
export function normalizeContactForEditor(content: Record<string, unknown>): Record<string, unknown> {
  const contact = content as ContactContent;
  const locations = resolveContactLocations(contact).map(({ name, address, mapEmbedUrl }) => ({
    name,
    address,
    mapEmbedUrl,
  }));

  return {
    title: contact.title ?? "",
    intro: contact.intro ?? "",
    companyName: contact.companyName ?? "",
    tel: contact.tel ?? "",
    email: contact.email ?? "",
    address: contact.address ?? "",
    hours: contact.hours ?? "",
    locations,
  };
}

export function sanitizeContactLocations(value: unknown): ContactLocation[] {
  if (!Array.isArray(value)) return [];

  const rows: ContactLocation[] = [];
  for (const item of value) {
    if (typeof item !== "object" || item === null) continue;
    const row = item as Record<string, unknown>;
    const safe = normalizeMapEmbedUrl(String(row.mapEmbedUrl ?? ""));
    const name = String(row.name ?? "").trim();
    const address = String(row.address ?? "").trim();

    if (!name && !address && !safe) continue;

    rows.push({
      name: name || "Location",
      ...(address ? { address } : {}),
      mapEmbedUrl: safe ?? "",
    });
  }
  return rows;
}
