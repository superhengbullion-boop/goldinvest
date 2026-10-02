import { resolveContactLocations } from "@/lib/contact-locations";
import { getContact } from "@/lib/data";
import { DEFAULT_CONTACT } from "@/lib/defaults";
import { DEFAULT_MAP_EMBED_URL } from "@/lib/map-embed";
import type { ContactContent } from "@/lib/types";

export const dynamic = "force-dynamic";

const SITE = "https://superhengbullion.com.my";

function text(value: unknown, fallback: string) {
  const next = typeof value === "string" ? value.trim() : "";
  return next || fallback;
}

function mapFor(address: string) {
  const query = address.replace(/\s+/g, " ").trim();
  return `https://maps.google.com/maps?q=${encodeURIComponent(query)}&hl=en&z=16&output=embed`;
}

function companyBody(content: ContactContent) {
  const offices = resolveContactLocations(content)
    .map((office) => {
      const address = text(office.address, "");
      if (!address) return null;
      return {
        name: text(office.name, "Office"),
        address,
        mapEmbedUrl: mapFor(address),
      };
    })
    .filter((office): office is { name: string; address: string; mapEmbedUrl: string } => office !== null);

  if (offices.length === 0) {
    const address = text(content.address, DEFAULT_CONTACT.address);
    offices.push({ name: "Office", address, mapEmbedUrl: mapFor(address) });
  }

  const first = offices[0];
  return {
    companyName: text(content.companyName, DEFAULT_CONTACT.companyName),
    tel: text(content.tel, DEFAULT_CONTACT.tel),
    email: text(content.email, DEFAULT_CONTACT.email),
    website: SITE,
    aboutUrl: `${SITE}/about`,
    termsUrl: `${SITE}/terms`,
    address: first.address,
    hours: text(content.hours, DEFAULT_CONTACT.hours),
    mapEmbedUrl: first.mapEmbedUrl || DEFAULT_MAP_EMBED_URL,
    offices,
  };
}

export async function GET() {
  try {
    const { content } = await getContact();
    return Response.json(companyBody(content));
  } catch {
    return Response.json(companyBody(DEFAULT_CONTACT));
  }
}
