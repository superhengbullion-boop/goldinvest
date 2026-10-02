"use server";
import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";
import { asBool, execute, isDuplicateKey, newId, query, queryOne } from "@/lib/db";
import { getSession } from "@/lib/session";
import { isPageSlug, PAGE_META } from "@/lib/cms";
import { sanitizePageContent } from "@/lib/richtext";
import { APP_CONTENT_SLUG, DEFAULT_APP_CONTENT, appLabelText } from "@/lib/app-content";
import { SITE_SETTINGS_SLUG } from "@/lib/seo";
import { MANUAL_RATES_SLUG } from "@/lib/metal-quotes";
import type { RateBookAdjRow } from "@/lib/data";

async function requireAdmin() {
  const session = await getSession();
  if (!session?.userId) throw new Error("Unauthorized");
  return session;
}

// ── pages ─────────────────────────────────────────────────────────────────────

export async function updatePage(formData: FormData) {
  await requireAdmin();
  const slug = String(formData.get("slug") ?? "");
  if (!isPageSlug(slug)) throw new Error("Unknown page");
  const title       = String(formData.get("title")       ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const raw         = String(formData.get("content")     ?? "{}");
  let content: unknown;
  try { content = JSON.parse(raw); } catch { throw new Error("Invalid content payload"); }

  const sanitized = sanitizePageContent(slug, content as Record<string, unknown>);
  if (typeof sanitized.seoKeywords === "string") {
    sanitized.seoKeywords = sanitized.seoKeywords.trim();
  }

  await execute(
    `INSERT INTO \`Page\`(\`id\`,\`slug\`,\`title\`,\`description\`,\`content\`,\`createdAt\`,\`updatedAt\`)
     VALUES(?,?,?,?,?,NOW(3),NOW(3))
     ON DUPLICATE KEY UPDATE \`title\`=VALUES(\`title\`),\`description\`=VALUES(\`description\`),
       \`content\`=VALUES(\`content\`),\`updatedAt\`=NOW(3)`,
    [newId(), slug, title, description, JSON.stringify(sanitized)],
  );
  revalidatePath(PAGE_META[slug].href);
  revalidatePath("/admin");
  revalidatePath(`/admin/pages/${slug}`);
}

export async function updateSiteSettings(formData: FormData) {
  await requireAdmin();
  const siteName = String(formData.get("siteName") ?? "").trim();
  const logo = String(formData.get("logo") ?? "").trim();
  const title = String(formData.get("title") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const keywords = String(formData.get("keywords") ?? "").trim();
  if (!siteName || !title) throw new Error("Site name and SEO title are required.");

  const content = { siteName, logo, keywords };
  await execute(
    `INSERT INTO \`Page\`(\`id\`,\`slug\`,\`title\`,\`description\`,\`content\`,\`createdAt\`,\`updatedAt\`)
     VALUES(?,?,?,?,?,NOW(3),NOW(3))
     ON DUPLICATE KEY UPDATE \`title\`=VALUES(\`title\`),\`description\`=VALUES(\`description\`),
       \`content\`=VALUES(\`content\`),\`updatedAt\`=NOW(3)`,
    [newId(), SITE_SETTINGS_SLUG, title, description, JSON.stringify(content)],
  );
  revalidatePath("/", "layout");
  revalidatePath("/admin/settings");
  revalidatePath("/admin/login");
}

function appLabel(formData: FormData, name: keyof typeof DEFAULT_APP_CONTENT) {
  return appLabelText(formData.get(name), DEFAULT_APP_CONTENT[name]);
}

export async function updateAppContent(formData: FormData) {
  await requireAdmin();
  const content = {
    logo: String(formData.get("logo") ?? "").trim(),
    ratesTitle: appLabel(formData, "ratesTitle"),
    infoLabel: appLabel(formData, "infoLabel"),
    buyLabel: appLabel(formData, "buyLabel"),
    sellLabel: appLabel(formData, "sellLabel"),
    lockBuyLabel: appLabel(formData, "lockBuyLabel"),
    lockSellLabel: appLabel(formData, "lockSellLabel"),
    comingSoonLabel: appLabel(formData, "comingSoonLabel"),
  };
  await execute(
    `INSERT INTO \`Page\`(\`id\`,\`slug\`,\`title\`,\`description\`,\`content\`,\`createdAt\`,\`updatedAt\`)
     VALUES(?,?,?,?,?,NOW(3),NOW(3))
     ON DUPLICATE KEY UPDATE \`content\`=VALUES(\`content\`),\`updatedAt\`=NOW(3)`,
    [newId(), APP_CONTENT_SLUG, "App content", "Mobile app logo and labels", JSON.stringify(content)],
  );
  revalidatePath("/admin/app");
}

export async function saveManualFxRates(formData: FormData) {
  await requireAdmin();
  const content = {
    buy: Number(formData.get("idr_buy") ?? 0) || 0,
    sell: Number(formData.get("idr_sell") ?? 0) || 0,
  };
  await execute(
    `INSERT INTO \`Page\`(\`id\`,\`slug\`,\`title\`,\`description\`,\`content\`,\`createdAt\`,\`updatedAt\`)
     VALUES(?,?,?,?,?,NOW(3),NOW(3))
     ON DUPLICATE KEY UPDATE \`content\`=VALUES(\`content\`),\`updatedAt\`=NOW(3)`,
    [newId(), MANUAL_RATES_SLUG, "Manual FX rates", "Admin-controlled IDR/MYR rates", JSON.stringify(content)],
  );
  revalidatePath("/admin/rates");
  revalidatePath("/rates");
  revalidatePath("/");
}

// ── rates ─────────────────────────────────────────────────────────────────────

export async function saveRate(formData: FormData) {
  await requireAdmin();
  const id        = String(formData.get("id")        ?? "");
  const metal     = String(formData.get("metal")     ?? "").trim();
  const product   = String(formData.get("product")   ?? "").trim();
  const unit      = String(formData.get("unit")      ?? "RM / Gram").trim();
  const buyPrice  = Number(formData.get("buyPrice"));
  const sellPrice = Number(formData.get("sellPrice"));
  const sortOrder = Number(formData.get("sortOrder") ?? 0);
  const isActive  = formData.get("isActive") === "on";

  if (!metal || !product || Number.isNaN(buyPrice) || Number.isNaN(sellPrice))
    throw new Error("Please fill in metal, product, buy and sell prices.");

  if (id) {
    await execute(
      "UPDATE `Rate` SET `metal`=?,`product`=?,`unit`=?,`buyPrice`=?,`sellPrice`=?,`sortOrder`=?,`isActive`=?,`updatedAt`=NOW(3) WHERE `id`=?",
      [metal, product, unit, buyPrice, sellPrice, sortOrder, isActive ? 1 : 0, id],
    );
  } else {
    await execute(
      "INSERT INTO `Rate`(`id`,`metal`,`product`,`unit`,`buyPrice`,`sellPrice`,`sortOrder`,`isActive`,`createdAt`,`updatedAt`) VALUES(?,?,?,?,?,?,?,?,NOW(3),NOW(3))",
      [newId(), metal, product, unit, buyPrice, sellPrice, sortOrder, isActive ? 1 : 0],
    );
  }
  revalidatePath("/"); revalidatePath("/rates"); revalidatePath("/admin/rates");
}

export async function deleteRate(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  if (!id) return;
  await execute("DELETE FROM `Rate` WHERE `id`=?", [id]);
  revalidatePath("/"); revalidatePath("/rates"); revalidatePath("/admin/rates");
}

// ── messages ──────────────────────────────────────────────────────────────────

export async function markMessageRead(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  if (!id) return;
  await execute("UPDATE `ContactMessage` SET `read`=1 WHERE `id`=?", [id]);
  revalidatePath("/admin/messages"); revalidatePath("/admin", "layout");
}

export async function deleteMessage(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  if (!id) return;
  await execute("DELETE FROM `ContactMessage` WHERE `id`=?", [id]);
  revalidatePath("/admin/messages"); revalidatePath("/admin", "layout");
}

// ── gold API ──────────────────────────────────────────────────────────────────

function revalidateRates() {
  revalidatePath("/"); revalidatePath("/rates");
  revalidatePath("/admin/rates"); revalidatePath("/admin");
}

export async function fetchRatesNow() {
  await requireAdmin();
  const [{ refreshElizQuotes }, { refreshMetalQuotes }] = await Promise.all([
    import("@/lib/eliz-sync"),
    import("@/lib/goldapi"),
  ]);
  await Promise.allSettled([
    refreshElizQuotes("manual"),
    refreshMetalQuotes("manual"),
  ]);
  revalidateRates();
}

export async function addRefreshTime(formData: FormData) {
  await requireAdmin();
  const { normalizeClockTime } = await import("@/lib/rate-time");
  const time = normalizeClockTime(String(formData.get("time") ?? ""));
  if (!time) throw new Error("Enter a valid time (HH:MM).");
  const existing = await queryOne<{ id: string }>(
    "SELECT `id` FROM `RateRefreshTime` WHERE `time`=? LIMIT 1", [time],
  );
  if (!existing) await execute(
    "INSERT INTO `RateRefreshTime`(`id`,`time`,`createdAt`) VALUES(?,?,NOW(3))", [newId(), time],
  );
  revalidatePath("/admin/rates");
}

export async function deleteRefreshTime(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  if (!id) return;
  await execute("DELETE FROM `RateRefreshTime` WHERE `id`=?", [id]);
  revalidatePath("/admin/rates");
}

// ── rate books ────────────────────────────────────────────────────────────────

export async function createRateBook(formData: FormData) {
  await requireAdmin();
  const { defaultAdjustments } = await import("@/lib/metal-quotes");
  const name = String(formData.get("name") ?? "").trim();
  if (!name) throw new Error("Name is required.");
  const bookId = newId();
  await execute(
    "INSERT INTO `RateBook`(`id`,`name`,`isActive`,`createdAt`,`updatedAt`) VALUES(?,?,1,NOW(3),NOW(3))",
    [bookId, name],
  );
  for (const adj of defaultAdjustments()) {
    await execute(
      "INSERT INTO `RateBookAdj`(`id`,`bookId`,`metal`,`unitKey`,`buyDelta`,`sellDelta`) VALUES(?,?,?,?,?,?)",
      [newId(), bookId, adj.metal, adj.unitKey, adj.buyDelta, adj.sellDelta],
    );
  }
  revalidatePath("/admin/rates");
}

export async function toggleRateBook(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  if (!id) return;
  const book = await queryOne<{ isActive: unknown }>(
    "SELECT `isActive` FROM `RateBook` WHERE `id`=? LIMIT 1", [id],
  );
  if (!book) return;
  await execute(
    "UPDATE `RateBook` SET `isActive`=?,`updatedAt`=NOW(3) WHERE `id`=?",
    [asBool(book.isActive) ? 0 : 1, id],
  );
  revalidatePath("/admin/rates");
}

export async function deleteRateBook(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  if (!id) return;
  await execute("DELETE FROM `RateBook` WHERE `id`=?", [id]);
  revalidatePath("/admin/rates");
}

export async function saveRateBookAdjustments(formData: FormData) {
  await requireAdmin();
  const { OFFSETTABLE_ROWS } = await import("@/lib/metal-quotes");
  const id = String(formData.get("id") ?? "");
  if (!id) return;
  const book = await queryOne<{ id: string; name: string }>(
    "SELECT `id`,`name` FROM `RateBook` WHERE `id`=? LIMIT 1", [id],
  );
  if (!book) return;
  const adjs = await query<RateBookAdjRow>(
    "SELECT * FROM `RateBookAdj` WHERE `bookId`=?", [id],
  );
  const name = String(formData.get("name") ?? "").trim() || book.name;
  await execute("UPDATE `RateBook` SET `name`=?,`updatedAt`=NOW(3) WHERE `id`=?", [name, id]);

  for (const row of OFFSETTABLE_ROWS) {
    const buy  = Number(formData.get(`adj_${row.metal}_${row.unitKey}_buy`)  ?? 0);
    const sell = Number(formData.get(`adj_${row.metal}_${row.unitKey}_sell`) ?? 0);
    const b = Number.isFinite(buy)  ? buy  : 0;
    const s = Number.isFinite(sell) ? sell : 0;
    const existing = adjs.find((a) => a.metal === row.metal && a.unitKey === row.unitKey);
    if (existing) {
      await execute(
        "UPDATE `RateBookAdj` SET `buyDelta`=?,`sellDelta`=? WHERE `id`=?", [b, s, existing.id],
      );
    } else {
      await execute(
        "INSERT INTO `RateBookAdj`(`id`,`bookId`,`metal`,`unitKey`,`buyDelta`,`sellDelta`) VALUES(?,?,?,?,?,?)",
        [newId(), id, row.metal, row.unitKey, b, s],
      );
    }
  }
  revalidatePath("/admin/rates"); revalidatePath("/rates");
  revalidatePath("/"); revalidatePath("/admin/members");
}

// ── members ───────────────────────────────────────────────────────────────────

export async function createMember(formData: FormData) {
  await requireAdmin();
  const { formatMemberId } = await import("@/lib/member-id");
  const username    = String(formData.get("username")    ?? "").trim();
  const password    = String(formData.get("password")    ?? "");
  const phone       = String(formData.get("phone")       ?? "").trim();
  const email       = String(formData.get("email")       ?? "").trim().toLowerCase();
  const fullName    = String(formData.get("fullName")    ?? "").trim();
  const rateBookId  = String(formData.get("rateBookId")  ?? "").trim() || null;

  if (!username || !password || !phone || !email || !fullName)
    throw new Error("Username, password, phone, email, and full name are required.");

  const hash = await bcrypt.hash(password, 12);
  const tmp  = `TMP${crypto.randomUUID().replace(/-/g, "").slice(0, 12)}`;
  try {
    const result = await execute(
      "INSERT INTO `Member`(`memberId`,`username`,`passwordHash`,`phone`,`email`,`fullName`,`isActive`,`rateBookId`,`createdAt`,`updatedAt`) VALUES(?,?,?,?,?,?,1,?,NOW(3),NOW(3))",
      [tmp, username, hash, phone, email, fullName, rateBookId],
    );
    const insertId = Number(result.insertId);
    await execute(
      "UPDATE `Member` SET `memberId`=?,`updatedAt`=NOW(3) WHERE `id`=?",
      [formatMemberId(insertId), insertId],
    );
  } catch (e) {
    if (isDuplicateKey(e)) throw new Error("Username or email already exists.");
    throw e;
  }
  revalidatePath("/admin/members");
}

export async function updateMember(formData: FormData) {
  await requireAdmin();
  const id = Number(formData.get("id"));
  if (!Number.isInteger(id) || id < 1) return;

  const username   = String(formData.get("username")   ?? "").trim();
  const phone      = String(formData.get("phone")      ?? "").trim();
  const email      = String(formData.get("email")      ?? "").trim().toLowerCase();
  const fullName   = String(formData.get("fullName")   ?? "").trim();
  const password   = String(formData.get("password")   ?? "");
  const rateBookId = String(formData.get("rateBookId") ?? "").trim() || null;
  const isActive   = formData.get("isActive") === "on";

  if (!username || !phone || !email || !fullName)
    throw new Error("Username, phone, email, and full name are required.");

  try {
    if (password) {
      await execute(
        "UPDATE `Member` SET `username`=?,`phone`=?,`email`=?,`fullName`=?,`rateBookId`=?,`isActive`=?,`passwordHash`=?,`updatedAt`=NOW(3) WHERE `id`=?",
        [username, phone, email, fullName, rateBookId, isActive ? 1 : 0, await bcrypt.hash(password, 12), id],
      );
    } else {
      await execute(
        "UPDATE `Member` SET `username`=?,`phone`=?,`email`=?,`fullName`=?,`rateBookId`=?,`isActive`=?,`updatedAt`=NOW(3) WHERE `id`=?",
        [username, phone, email, fullName, rateBookId, isActive ? 1 : 0, id],
      );
    }
  } catch (e) {
    if (isDuplicateKey(e)) throw new Error("Username or email already exists.");
    throw e;
  }
  revalidatePath("/admin/members");
  revalidatePath(`/admin/members/${id}`);
}

export async function deleteMember(formData: FormData) {
  await requireAdmin();
  const id = Number(formData.get("id"));
  if (!Number.isInteger(id) || id < 1) return;
  await execute("DELETE FROM `Member` WHERE `id`=?", [id]);
  revalidatePath("/admin/members");
}
