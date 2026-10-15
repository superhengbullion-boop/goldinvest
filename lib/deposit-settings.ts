import { asJson, queryOne } from "@/lib/db";

export const DEPOSIT_SETTINGS_SLUG = "deposit-settings";

export const DEFAULT_DEPOSIT_SETTINGS = {
  infoHeading: "SuperHeng Gold Information",
  supportPhone: "+6072870221",
  accountHolderName: "SuperHeng Precious Metals Sdn Bhd",
  bankName: "OCBC Bank Berhad",
  bankAccount: "7161127883",
  fundInstructions: [
    "Please transfer owed to this SuperHeng Gold Bank Account using a verified account.",
    "Upload a screenshot of the transfer after completion.",
    "The amount will be verified and recorded by the administrator.",
    "If you have any questions, please contact our customer support.",
  ],
  xauInstructions: [
    "Please contact SuperHeng Gold customer support for assistance with deposit.",
    "The administrator will review and record the quantity of gold received.",
  ],
};

export type DepositSettings = typeof DEFAULT_DEPOSIT_SETTINGS;

type PageContentRow = { content: unknown };

export function normalizeDepositSettings(raw: unknown): DepositSettings {
  const content = raw && typeof raw === "object" ? (raw as Record<string, unknown>) : {};
  return {
    infoHeading: text(content.infoHeading, DEFAULT_DEPOSIT_SETTINGS.infoHeading, 80),
    supportPhone: text(content.supportPhone, DEFAULT_DEPOSIT_SETTINGS.supportPhone, 40),
    accountHolderName: text(content.accountHolderName, DEFAULT_DEPOSIT_SETTINGS.accountHolderName, 120),
    bankName: text(content.bankName, DEFAULT_DEPOSIT_SETTINGS.bankName, 120),
    bankAccount: text(content.bankAccount, DEFAULT_DEPOSIT_SETTINGS.bankAccount, 40),
    fundInstructions: steps(content.fundInstructions, DEFAULT_DEPOSIT_SETTINGS.fundInstructions),
    xauInstructions: steps(content.xauInstructions, DEFAULT_DEPOSIT_SETTINGS.xauInstructions),
  };
}

export async function getDepositSettings(): Promise<DepositSettings> {
  try {
    const row = await queryOne<PageContentRow>(
      "SELECT `content` FROM `Page` WHERE `slug`=? LIMIT 1",
      [DEPOSIT_SETTINGS_SLUG],
    );
    return normalizeDepositSettings(asJson(row?.content, {}));
  } catch {
    return { ...DEFAULT_DEPOSIT_SETTINGS, fundInstructions: [...DEFAULT_DEPOSIT_SETTINGS.fundInstructions], xauInstructions: [...DEFAULT_DEPOSIT_SETTINGS.xauInstructions] };
  }
}

function text(value: unknown, fallback: string, max: number) {
  const next = typeof value === "string" ? value.trim() : "";
  if (!next) return fallback;
  return next.slice(0, max);
}

function steps(value: unknown, fallback: string[]) {
  const source = Array.isArray(value)
    ? value
    : typeof value === "string"
      ? value.split(/\r?\n/)
      : [];
  const lines = source
    .map((line) => (typeof line === "string" ? line.trim() : ""))
    .filter(Boolean)
    .slice(0, 8)
    .map((line) => line.slice(0, 300));
  return lines.length > 0 ? lines : [...fallback];
}
