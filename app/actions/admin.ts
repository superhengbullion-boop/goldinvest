"use server";

import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";
import { Prisma } from "@/app/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { isPageSlug, PAGE_META } from "@/lib/cms";

async function requireAdmin() {
  const session = await getSession();
  if (!session?.userId) {
    throw new Error("Unauthorized");
  }
  return session;
}

export async function updatePage(formData: FormData) {
  await requireAdmin();
  const slug = String(formData.get("slug") ?? "");
  if (!isPageSlug(slug)) {
    throw new Error("Unknown page");
  }

  const title = String(formData.get("title") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const raw = String(formData.get("content") ?? "{}");

  let content: unknown;
  try {
    content = JSON.parse(raw);
  } catch {
    throw new Error("Invalid content payload");
  }

  await prisma.page.upsert({
    where: { slug },
    update: { title, description, content: content as object },
    create: { slug, title, description, content: content as object },
  });

  revalidatePath(PAGE_META[slug].href);
  revalidatePath("/admin");
  revalidatePath(`/admin/pages/${slug}`);
}

export async function saveRate(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  const metal = String(formData.get("metal") ?? "").trim();
  const product = String(formData.get("product") ?? "").trim();
  const unit = String(formData.get("unit") ?? "RM / Gram").trim();
  const buyPrice = Number(formData.get("buyPrice"));
  const sellPrice = Number(formData.get("sellPrice"));
  const sortOrder = Number(formData.get("sortOrder") ?? 0);
  const isActive = formData.get("isActive") === "on";

  if (!metal || !product || Number.isNaN(buyPrice) || Number.isNaN(sellPrice)) {
    throw new Error("Please fill in metal, product, buy and sell prices.");
  }

  const data = { metal, product, unit, buyPrice, sellPrice, sortOrder, isActive };

  if (id) {
    await prisma.rate.update({ where: { id }, data });
  } else {
    await prisma.rate.create({ data });
  }

  revalidatePath("/");
  revalidatePath("/rates");
  revalidatePath("/admin/rates");
}

export async function deleteRate(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  if (!id) return;
  await prisma.rate.delete({ where: { id } });
  revalidatePath("/");
  revalidatePath("/rates");
  revalidatePath("/admin/rates");
}

export async function markMessageRead(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  if (!id) return;
  await prisma.contactMessage.update({
    where: { id },
    data: { read: true },
  });
  revalidatePath("/admin/messages");
  revalidatePath("/admin", "layout");
}

export async function deleteMessage(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  if (!id) return;
  await prisma.contactMessage.delete({ where: { id } });
  revalidatePath("/admin/messages");
  revalidatePath("/admin", "layout");
}

function revalidateRates() {
  revalidatePath("/");
  revalidatePath("/rates");
  revalidatePath("/admin/rates");
  revalidatePath("/admin");
}

export async function fetchRatesNow() {
  await requireAdmin();
  const { refreshMetalQuotes } = await import("@/lib/goldapi");
  await refreshMetalQuotes("manual");
  revalidateRates();
}

export async function addRefreshTime(formData: FormData) {
  await requireAdmin();
  const { normalizeClockTime } = await import("@/lib/rate-time");
  const time = normalizeClockTime(String(formData.get("time") ?? ""));
  if (!time) {
    throw new Error("Enter a valid time (HH:MM).");
  }

  const existing = await prisma.rateRefreshTime.findUnique({ where: { time } });
  if (!existing) {
    await prisma.rateRefreshTime.create({ data: { time } });
  }
  revalidatePath("/admin/rates");
}

export async function deleteRefreshTime(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  if (!id) return;
  await prisma.rateRefreshTime.delete({ where: { id } });
  revalidatePath("/admin/rates");
}

function adjField(metal: string, unitKey: string, side: "buy" | "sell") {
  return `adj_${metal}_${unitKey}_${side}`;
}

export async function createRateBook(formData: FormData) {
  await requireAdmin();
  const { defaultAdjustments } = await import("@/lib/metal-quotes");
  const name = String(formData.get("name") ?? "").trim();
  if (!name) {
    throw new Error("Name is required.");
  }

  await prisma.rateBook.create({
    data: {
      name,
      adjustments: { create: defaultAdjustments() },
    },
  });
  revalidatePath("/admin/rates");
}

export async function toggleRateBook(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  if (!id) return;
  const book = await prisma.rateBook.findUnique({ where: { id } });
  if (!book) return;
  await prisma.rateBook.update({
    where: { id },
    data: { isActive: !book.isActive },
  });
  revalidatePath("/admin/rates");
}

export async function deleteRateBook(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  if (!id) return;
  await prisma.rateBook.delete({ where: { id } });
  revalidatePath("/admin/rates");
}

export async function saveRateBookAdjustments(formData: FormData) {
  await requireAdmin();
  const { BOARD_UNITS, RATE_METALS } = await import("@/lib/metal-quotes");
  const id = String(formData.get("id") ?? "");
  if (!id) return;

  const book = await prisma.rateBook.findUnique({
    where: { id },
    include: { adjustments: true },
  });
  if (!book) return;

  const name = String(formData.get("name") ?? "").trim() || book.name;

  await prisma.rateBook.update({ where: { id }, data: { name } });

  for (const metal of RATE_METALS) {
    for (const unit of BOARD_UNITS) {
      const buyDelta = Number(formData.get(adjField(metal.key, unit.key, "buy")) ?? 0);
      const sellDelta = Number(formData.get(adjField(metal.key, unit.key, "sell")) ?? 0);
      const existing = book.adjustments.find(
        (item) => item.metal === metal.key && item.unitKey === unit.key,
      );
      const data = {
        buyDelta: Number.isFinite(buyDelta) ? buyDelta : 0,
        sellDelta: Number.isFinite(sellDelta) ? sellDelta : 0,
      };
      if (existing) {
        await prisma.rateBookAdj.update({ where: { id: existing.id }, data });
      } else {
        await prisma.rateBookAdj.create({
          data: { bookId: id, metal: metal.key, unitKey: unit.key, ...data },
        });
      }
    }
  }

  revalidatePath("/admin/rates");
  revalidatePath("/rates");
  revalidatePath("/");
  revalidatePath("/admin/members");
}

export async function createMember(formData: FormData) {
  await requireAdmin();
  const { formatMemberId } = await import("@/lib/member-id");
  const username = String(formData.get("username") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const phone = String(formData.get("phone") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const fullName = String(formData.get("fullName") ?? "").trim();
  const rateBookId = String(formData.get("rateBookId") ?? "").trim() || null;

  if (!username || !password || !phone || !email || !fullName) {
    throw new Error("Username, password, phone, email, and full name are required.");
  }

  const passwordHash = await bcrypt.hash(password, 12);
  const placeholder = `TMP${crypto.randomUUID().replace(/-/g, "").slice(0, 12)}`;
  try {
    const member = await prisma.member.create({
      data: {
        memberId: placeholder,
        username,
        passwordHash,
        phone,
        email,
        fullName,
        rateBookId,
      },
    });
    await prisma.member.update({
      where: { id: member.id },
      data: { memberId: formatMemberId(member.id) },
    });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      throw new Error("Username or email already exists.");
    }
    throw error;
  }
  revalidatePath("/admin/members");
}

export async function updateMember(formData: FormData) {
  await requireAdmin();
  const { redirect } = await import("next/navigation");
  const id = Number(formData.get("id"));
  if (!Number.isInteger(id) || id < 1) return;

  const username = String(formData.get("username") ?? "").trim();
  const phone = String(formData.get("phone") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const fullName = String(formData.get("fullName") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const rateBookId = String(formData.get("rateBookId") ?? "").trim() || null;
  const isActive = formData.get("isActive") === "on";

  if (!username || !phone || !email || !fullName) {
    throw new Error("Username, phone, email, and full name are required.");
  }

  try {
    await prisma.member.update({
      where: { id },
      data: {
        username,
        phone,
        email,
        fullName,
        rateBookId,
        isActive,
        ...(password ? { passwordHash: await bcrypt.hash(password, 12) } : {}),
      },
    });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      throw new Error("Username or email already exists.");
    }
    throw error;
  }
  revalidatePath("/admin/members");
  redirect("/admin/members");
}

export async function deleteMember(formData: FormData) {
  await requireAdmin();
  const id = Number(formData.get("id"));
  if (!Number.isInteger(id) || id < 1) return;
  await prisma.member.delete({ where: { id } });
  revalidatePath("/admin/members");
}
