import { getSiteSettings } from "@/lib/data";
import { asJson, queryOne } from "@/lib/db";

export const APP_CONTENT_SLUG = "app";

export const DEFAULT_APP_CONTENT = {
  logo: "",
  ratesTitle: "Live rates",
  infoLabel: "INFO",
  buyLabel: "Super Heng BUY",
  sellLabel: "Super Heng SELL",
  lockBuyLabel: "LOCK BUY",
  lockSellLabel: "LOCK SELL",
  comingSoonLabel: "Coming Soon",
};

export type AppContent = typeof DEFAULT_APP_CONTENT;

type PageContentRow = { content: unknown };

export function appLabelText(value: unknown, fallback: string) {
  const text = typeof value === "string" ? value.trim() : "";
  if (!text) return fallback;
  if (text.length > 48) throw new Error("Keep each label under 48 characters.");
  return text;
}

function text(value: unknown, fallback: string) {
  const next = typeof value === "string" ? value.trim() : "";
  return next || fallback;
}

export function normalizeAppContent(raw: unknown): AppContent {
  const content = raw && typeof raw === "object" ? (raw as Record<string, unknown>) : {};
  return {
    logo: typeof content.logo === "string" ? content.logo.trim() : "",
    ratesTitle: text(content.ratesTitle, DEFAULT_APP_CONTENT.ratesTitle),
    infoLabel: text(content.infoLabel, DEFAULT_APP_CONTENT.infoLabel),
    buyLabel: text(content.buyLabel, DEFAULT_APP_CONTENT.buyLabel),
    sellLabel: text(content.sellLabel, DEFAULT_APP_CONTENT.sellLabel),
    lockBuyLabel: text(content.lockBuyLabel, DEFAULT_APP_CONTENT.lockBuyLabel),
    lockSellLabel: text(content.lockSellLabel, DEFAULT_APP_CONTENT.lockSellLabel),
    comingSoonLabel: text(content.comingSoonLabel, DEFAULT_APP_CONTENT.comingSoonLabel),
  };
}

export async function getAppContent(): Promise<AppContent> {
  try {
    const row = await queryOne<PageContentRow>(
      "SELECT `content` FROM `Page` WHERE `slug`=? LIMIT 1",
      [APP_CONTENT_SLUG],
    );
    return normalizeAppContent(asJson(row?.content, {}));
  } catch {
    return { ...DEFAULT_APP_CONTENT };
  }
}

export function absoluteAssetUrl(request: Request, path: string) {
  const value = path.trim();
  if (!value) return "";
  if (/^https?:\/\//i.test(value)) return value;
  const current = new URL(request.url);
  const headerHost = request.headers.get("x-forwarded-host") ?? request.headers.get("host");
  const host = headerHost && !headerHost.startsWith("0.0.0.0") ? headerHost : current.host;
  const proto = request.headers.get("x-forwarded-proto") ?? current.protocol.replace(":", "");
  const origin = `${proto}://${host}`;
  return value.startsWith("/") ? `${origin}${value}` : `${origin}/${value}`;
}

export async function appContentResponse(request: Request) {
  const content = await getAppContent();
  const site = await getSiteSettings().catch(() => null);
  const logo = content.logo || site?.logo || "";
  return {
    logoUrl: absoluteAssetUrl(request, logo),
    ratesTitle: content.ratesTitle,
    infoLabel: content.infoLabel,
    buyLabel: content.buyLabel,
    sellLabel: content.sellLabel,
    lockBuyLabel: content.lockBuyLabel,
    lockSellLabel: content.lockSellLabel,
    comingSoonLabel: content.comingSoonLabel,
  };
}
