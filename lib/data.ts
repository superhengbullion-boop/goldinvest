import "server-only";
import { execute, query, queryOne, asBool, asJson, newId, isDuplicateKey } from "@/lib/db";
import { startRateScheduler } from "@/lib/rate-scheduler";
import {
  DEFAULT_ABOUT, DEFAULT_CONTACT, DEFAULT_HOME, DEFAULT_RATES_PAGE, DEFAULT_TERMS,
} from "@/lib/defaults";
import type {
  AboutContent, ContactContent, HomeContent, PageSlug, RatesPageContent, TermsContent,
} from "@/lib/types";

const FALLBACKS = {
  home: DEFAULT_HOME,
  about: DEFAULT_ABOUT,
  terms: DEFAULT_TERMS,
  rates: DEFAULT_RATES_PAGE,
  contact: DEFAULT_CONTACT,
} as const;

// ── row types ─────────────────────────────────────────────────────────────────

export type PageRow = {
  id: string; slug: string; title: string; description: string | null; content: unknown;
};

export type RateRow = {
  id: string; metal: string; product: string; unit: string;
  buyPrice: string; sellPrice: string; sortOrder: number; isActive: unknown; createdAt: Date;
};

export type MetalQuoteRow = {
  id: string; metal: string; currency: string; symbol: string;
  price: string; bid: string | null; ask: string | null; unit: string;
  priceGram: string | null; priceKg: string | null; priceTael: string | null;
  melt24k: string | null; melt22k: string | null; melt21k: string | null; melt18k: string | null;
  change: string | null; changePercent: string | null;
  raw: unknown; fetchedAt: Date; source: string;
};

export type RateBookAdjRow = {
  id: string; bookId: string; metal: string; unitKey: string;
  buyDelta: string; sellDelta: string;
};

export type RateBookRow = {
  id: string; name: string; isActive: boolean;
  createdAt: Date; updatedAt: Date; adjustments: RateBookAdjRow[];
};

export type MemberRow = {
  id: number; memberId: string; username: string; passwordHash: string;
  phone: string; email: string; fullName: string; isActive: boolean;
  rateBookId: string | null; createdAt: Date; updatedAt: Date;
  rateBook: { id: string; name: string } | null;
};

export type ContactMessageRow = {
  id: string; name: string; email: string; phone: string;
  message: string; read: boolean; createdAt: Date;
};

// ── pages ─────────────────────────────────────────────────────────────────────

export async function getPage<T>(slug: PageSlug, fallback: T): Promise<{
  title: string; description: string | null; content: T;
}> {
  try {
    startRateScheduler();
    const row = await queryOne<PageRow>(
      "SELECT `id`,`slug`,`title`,`description`,`content` FROM `Page` WHERE `slug`=? LIMIT 1",
      [slug],
    );
    if (!row) return { title: slug, description: null, content: fallback };
    return {
      title: row.title,
      description: row.description,
      content: { ...fallback, ...asJson(row.content, {}) } as T,
    };
  } catch (err) {
    console.error("[cms] getPage failed, using fallback:", err);
    return { title: slug, description: null, content: fallback };
  }
}

export async function getHome()     { return getPage<HomeContent>("home", FALLBACKS.home); }
export async function getAbout()    { return getPage<AboutContent>("about", FALLBACKS.about); }
export async function getTerms()    { return getPage<TermsContent>("terms", FALLBACKS.terms); }
export async function getRatesPage(){ return getPage<RatesPageContent>("rates", FALLBACKS.rates); }
export async function getContact()  { return getPage<ContactContent>("contact", FALLBACKS.contact); }

export async function getPages() {
  const rows = await query<PageRow>("SELECT * FROM `Page` ORDER BY `slug` ASC");
  return rows.map((r) => ({ ...r, content: asJson(r.content, {}) }));
}

export async function getPageBySlug(slug: string) {
  const row = await queryOne<PageRow>(
    "SELECT * FROM `Page` WHERE `slug`=? LIMIT 1", [slug],
  );
  return row ? { ...row, content: asJson(row.content, {}) } : null;
}

// ── rates ─────────────────────────────────────────────────────────────────────

export async function getRates() {
  const rows = await query<RateRow>(
    "SELECT * FROM `Rate` WHERE `isActive`=1 ORDER BY `sortOrder` ASC, `metal` ASC",
  );
  return rows.map((r) => ({ ...r, isActive: asBool(r.isActive) }));
}

export async function getAllRates() {
  const rows = await query<RateRow>(
    "SELECT * FROM `Rate` ORDER BY `sortOrder` ASC, `createdAt` ASC",
  );
  return rows.map((r) => ({ ...r, isActive: asBool(r.isActive) }));
}

// ── metal quotes ──────────────────────────────────────────────────────────────

export async function getMetalQuotes(): Promise<MetalQuoteRow[]> {
  try {
    return await query<MetalQuoteRow>(
      "SELECT * FROM `MetalQuote` ORDER BY `metal` DESC, `currency` ASC",
    );
  } catch (err) {
    console.error("[cms] getMetalQuotes failed:", err);
    return [];
  }
}

export async function getLatestQuoteFetch() {
  return queryOne<{ fetchedAt: Date; source: string }>(
    "SELECT `fetchedAt`,`source` FROM `MetalQuote` ORDER BY `fetchedAt` DESC LIMIT 1",
  );
}

export async function getRateRefreshTimes() {
  return query<{ id: string; time: string; createdAt: Date }>(
    "SELECT `id`,`time`,`createdAt` FROM `RateRefreshTime` ORDER BY `time` ASC",
  );
}

// ── rate books ────────────────────────────────────────────────────────────────

export async function getRateBooks(): Promise<RateBookRow[]> {
  const books = await query<Omit<RateBookRow, "adjustments"> & { isActive: unknown }>(
    "SELECT * FROM `RateBook` ORDER BY `createdAt` ASC",
  );
  if (books.length === 0) return [];
  const ids = books.map((b) => b.id);
  const placeholders = ids.map(() => "?").join(",");
  const adjs = await query<RateBookAdjRow>(
    `SELECT * FROM \`RateBookAdj\` WHERE \`bookId\` IN (${placeholders})`, ids,
  );
  return books.map((b) => ({
    ...b,
    isActive: asBool(b.isActive),
    adjustments: adjs.filter((a) => a.bookId === b.id),
  }));
}

// ── members ───────────────────────────────────────────────────────────────────

type MemberDbRow = Omit<MemberRow, "isActive" | "rateBook"> & {
  isActive: unknown; bookRelId?: string | null; bookName?: string | null;
};

function mapMemberRow(row: MemberDbRow): MemberRow {
  return {
    ...row,
    isActive: asBool(row.isActive),
    rateBook: row.bookRelId ? { id: String(row.bookRelId), name: String(row.bookName ?? "") } : null,
  };
}

export async function getMembers(): Promise<MemberRow[]> {
  const rows = await query<MemberDbRow>(
    `SELECT m.*,b.\`id\` AS bookRelId,b.\`name\` AS bookName
     FROM \`Member\` m LEFT JOIN \`RateBook\` b ON b.\`id\`=m.\`rateBookId\`
     ORDER BY m.\`id\` ASC`,
  );
  return rows.map(mapMemberRow);
}

const PAGE_SIZE = 10;

export async function getMembersPage(filters: {
  username?: string; email?: string; phone?: string; page?: number;
}) {
  const conds: string[] = ["1=1"];
  const params: unknown[] = [];
  if (filters.username?.trim()) { conds.push("`username` LIKE ?"); params.push(`%${filters.username.trim()}%`); }
  if (filters.email?.trim())    { conds.push("`email` LIKE ?");    params.push(`%${filters.email.trim()}%`); }
  if (filters.phone?.trim())    { conds.push("`phone` LIKE ?");    params.push(`%${filters.phone.trim()}%`); }

  const where = conds.join(" AND ");
  const countRow = await queryOne<{ total: number }>(
    `SELECT COUNT(*) AS total FROM \`Member\` WHERE ${where}`, params,
  );
  const total = Number(countRow?.total ?? 0);
  const pageCount = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const page = Math.min(pageCount, Math.max(1, filters.page ?? 1));

  const rows = await query<MemberDbRow>(
    `SELECT m.*,b.\`id\` AS bookRelId,b.\`name\` AS bookName
     FROM \`Member\` m LEFT JOIN \`RateBook\` b ON b.\`id\`=m.\`rateBookId\`
     WHERE ${where}
     ORDER BY m.\`id\` DESC
     LIMIT ${PAGE_SIZE} OFFSET ${(page - 1) * PAGE_SIZE}`,
    params,
  );
  return { members: rows.map(mapMemberRow), total, page, pageCount, pageSize: PAGE_SIZE };
}

export async function getMemberById(id: number): Promise<MemberRow | null> {
  const row = await queryOne<MemberDbRow>(
    `SELECT m.*,b.\`id\` AS bookRelId,b.\`name\` AS bookName
     FROM \`Member\` m LEFT JOIN \`RateBook\` b ON b.\`id\`=m.\`rateBookId\`
     WHERE m.\`id\`=? LIMIT 1`, [id],
  );
  return row ? mapMemberRow(row) : null;
}

export async function getMemberCount(): Promise<number> {
  const row = await queryOne<{ total: number }>("SELECT COUNT(*) AS total FROM `Member`");
  return Number(row?.total ?? 0);
}

// ── messages ──────────────────────────────────────────────────────────────────

export async function getMessages(): Promise<ContactMessageRow[]> {
  const rows = await query<ContactMessageRow & { read: unknown }>(
    "SELECT * FROM `ContactMessage` ORDER BY `createdAt` DESC",
  );
  return rows.map((r) => ({ ...r, read: asBool(r.read) }));
}

export async function getUnreadMessageCount(): Promise<number> {
  const row = await queryOne<{ total: number }>(
    "SELECT COUNT(*) AS total FROM `ContactMessage` WHERE `read`=0",
  );
  return Number(row?.total ?? 0);
}

// ── formatting ────────────────────────────────────────────────────────────────

export { formatPrice, formatQuotePrice } from "@/lib/format-price";

// re-export db helpers so callers can import from a single place
export { execute, query, queryOne, newId, isDuplicateKey } from "@/lib/db";
