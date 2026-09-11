import DOMPurify from "isomorphic-dompurify";
import { PAGE_FIELDS } from "@/lib/cms";
import { sanitizeContactLocations } from "@/lib/contact-locations";
import type { PageField, PageSlug } from "@/lib/types";

const ALLOWED_TAGS = ["p", "br", "strong", "b", "em", "i", "ul", "ol", "li", "a"];
const ALLOWED_ATTR = ["href", "target", "rel"];

export function sanitizeRichText(html: string): string {
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS,
    ALLOWED_ATTR,
  });
}

/** Legacy plain text or sanitized HTML for display. */
export function toRichHtml(value: string): string {
  const trimmed = value.trim();
  if (!trimmed) return "";

  if (/<[a-z][\s\S]*>/i.test(trimmed)) {
    return sanitizeRichText(trimmed);
  }

  const paragraphs = trimmed.split(/\n{2,}/).map((block) => {
    const escaped = block
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/\n/g, "<br>");
    return `<p>${escaped}</p>`;
  });

  return sanitizeRichText(paragraphs.join(""));
}

function sanitizeFieldValue(field: PageField, value: unknown): unknown {
  if (field.type === "richtext" && typeof value === "string") {
    return sanitizeRichText(toRichHtml(value));
  }

  if (field.type === "list" && Array.isArray(value)) {
    return value.map((item) => {
      if (typeof item !== "object" || item === null) return item;
      const row = { ...(item as Record<string, unknown>) };
      for (const itemField of field.itemFields) {
        if (itemField.type === "richtext" && typeof row[itemField.name] === "string") {
          row[itemField.name] = sanitizeRichText(toRichHtml(row[itemField.name] as string));
        }
      }
      return row;
    });
  }

  return value;
}

export function sanitizePageContent(
  slug: PageSlug,
  content: Record<string, unknown>,
): Record<string, unknown> {
  const out = { ...content };
  for (const field of PAGE_FIELDS[slug]) {
    out[field.name] = sanitizeFieldValue(field, out[field.name]);
  }
  if (slug === "terms") {
    delete out.sections;
  }
  if (slug === "contact") {
    out.locations = sanitizeContactLocations(out.locations);
    delete out.mapEmbedUrl;
  }
  return out;
}
