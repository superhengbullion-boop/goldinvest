import type { TermsContent, TermsSection } from "@/lib/types";

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function listTag(listStyle?: TermsSection["listStyle"]): "ul" | "ol" {
  return listStyle === "disc" ? "ul" : "ol";
}

/** Convert legacy structured clauses into HTML for the rich text editor. */
export function sectionsToHtml(sections: TermsSection[]): string {
  const parts: string[] = [];

  for (const section of sections) {
    parts.push(`<p><strong>${escapeHtml(section.heading)}</strong></p>`);
    if (section.body?.trim()) {
      parts.push(`<p>${escapeHtml(section.body)}</p>`);
    }
    if (section.items?.length) {
      const tag = listTag(section.listStyle);
      const items = section.items
        .map((item) => {
          let inner = "";
          if (item.term?.trim()) {
            inner += `<strong>&quot;${escapeHtml(item.term)}&quot;</strong> `;
          }
          inner += escapeHtml(item.text);
          if (item.subItems?.length) {
            inner += `<ul>${item.subItems.map((sub) => `<li>${escapeHtml(sub)}</li>`).join("")}</ul>`;
          }
          if (item.after?.trim()) {
            inner += `<p>${escapeHtml(item.after)}</p>`;
          }
          return `<li>${inner}</li>`;
        })
        .join("");
      parts.push(`<${tag}>${items}</${tag}>`);
    }
  }

  return parts.join("");
}

export function resolveTermsBody(content: TermsContent): string {
  if (content.body?.trim()) return content.body;
  if (content.sections?.length) return sectionsToHtml(content.sections);
  return "";
}

/** Strip legacy fields so admin only edits company, title, and body. */
export function normalizeTermsForEditor(content: Record<string, unknown>): Record<string, unknown> {
  const terms = content as TermsContent;
  return {
    companyName: terms.companyName ?? "",
    title: terms.title ?? "",
    body: resolveTermsBody(terms),
  };
}
