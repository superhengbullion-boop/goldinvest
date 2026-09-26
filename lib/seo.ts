import type { Metadata } from "next";

export const SITE_SETTINGS_SLUG = "settings";

export const DEFAULT_SITE_SETTINGS = {
  siteName: "Super Heng Bullion",
  logo: "/logo.jpg",
  title: "Super Heng Bullion",
  description: "Buy and sell physical gold at competitive rates with premium service.",
  keywords: "",
};

export type SiteSettings = typeof DEFAULT_SITE_SETTINGS;

export function splitKeywords(value: string | null | undefined): string[] {
  if (!value) return [];
  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

export function keywordsFromContent(content: unknown): string {
  if (!content || typeof content !== "object") return "";
  const value = (content as { seoKeywords?: unknown }).seoKeywords;
  return typeof value === "string" ? value : "";
}

export function pageMetadata(page: {
  title: string;
  description: string | null;
  content?: unknown;
}): Metadata {
  const keywords = splitKeywords(keywordsFromContent(page.content));
  return {
    title: page.title,
    description: page.description || undefined,
    ...(keywords.length > 0 ? { keywords } : {}),
  };
}
