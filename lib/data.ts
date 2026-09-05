import { prisma } from "@/lib/prisma";
import {
  DEFAULT_ABOUT,
  DEFAULT_CONTACT,
  DEFAULT_HOME,
  DEFAULT_RATES_PAGE,
  DEFAULT_TERMS,
} from "@/lib/defaults";
import type {
  AboutContent,
  ContactContent,
  HomeContent,
  PageSlug,
  RatesPageContent,
  TermsContent,
} from "@/lib/types";

const FALLBACKS = {
  home: DEFAULT_HOME,
  about: DEFAULT_ABOUT,
  terms: DEFAULT_TERMS,
  rates: DEFAULT_RATES_PAGE,
  contact: DEFAULT_CONTACT,
} as const;

export async function getPage<T>(slug: PageSlug, fallback: T): Promise<{
  title: string;
  description: string | null;
  content: T;
}> {
  const page = await prisma.page.findUnique({ where: { slug } });
  if (!page) {
    return { title: slug, description: null, content: fallback };
  }
  return {
    title: page.title,
    description: page.description,
    content: { ...fallback, ...(page.content as object) } as T,
  };
}

export async function getHome() {
  return getPage<HomeContent>("home", FALLBACKS.home);
}

export async function getAbout() {
  return getPage<AboutContent>("about", FALLBACKS.about);
}

export async function getTerms() {
  return getPage<TermsContent>("terms", FALLBACKS.terms);
}

export async function getRatesPage() {
  return getPage<RatesPageContent>("rates", FALLBACKS.rates);
}

export async function getContact() {
  return getPage<ContactContent>("contact", FALLBACKS.contact);
}

export async function getRates() {
  return prisma.rate.findMany({
    where: { isActive: true },
    orderBy: [{ sortOrder: "asc" }, { metal: "asc" }],
  });
}

export async function getAllRates() {
  return prisma.rate.findMany({
    orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
  });
}

export async function getMetalQuotes() {
  return prisma.metalQuote.findMany({
    orderBy: [{ metal: "desc" }, { currency: "asc" }],
  });
}

export async function getRateRefreshTimes() {
  return prisma.rateRefreshTime.findMany({
    orderBy: { time: "asc" },
  });
}

export async function getLatestQuoteFetch() {
  return prisma.metalQuote.findFirst({
    orderBy: { fetchedAt: "desc" },
    select: { fetchedAt: true, source: true },
  });
}

export async function getRateBooks() {
  return prisma.rateBook.findMany({
    include: { adjustments: true },
    orderBy: { createdAt: "asc" },
  });
}

export async function getMembers() {
  return prisma.member.findMany({
    include: { rateBook: { select: { id: true, name: true } } },
    orderBy: { id: "asc" },
  });
}

const MEMBER_PAGE_SIZE = 10;

export async function getMembersPage(filters: {
  username?: string;
  email?: string;
  phone?: string;
  page?: number;
}) {
  const username = filters.username?.trim() ?? "";
  const email = filters.email?.trim() ?? "";
  const phone = filters.phone?.trim() ?? "";

  const where = {
    AND: [
      username ? { username: { contains: username } } : {},
      email ? { email: { contains: email } } : {},
      phone ? { phone: { contains: phone } } : {},
    ],
  };

  const total = await prisma.member.count({ where });
  const pageCount = Math.max(1, Math.ceil(total / MEMBER_PAGE_SIZE));
  const page = Math.min(pageCount, Math.max(1, filters.page ?? 1));
  const members = await prisma.member.findMany({
    where,
    include: { rateBook: { select: { id: true, name: true } } },
    orderBy: { id: "desc" },
    skip: (page - 1) * MEMBER_PAGE_SIZE,
    take: MEMBER_PAGE_SIZE,
  });

  return { members, total, page, pageCount, pageSize: MEMBER_PAGE_SIZE };
}

export async function getMemberById(id: number) {
  return prisma.member.findUnique({
    where: { id },
    include: { rateBook: { select: { id: true, name: true } } },
  });
}

export async function getPages() {
  return prisma.page.findMany({ orderBy: { slug: "asc" } });
}

export async function getMessages() {
  return prisma.contactMessage.findMany({
    orderBy: { createdAt: "desc" },
  });
}

export async function getUnreadMessageCount() {
  return prisma.contactMessage.count({ where: { read: false } });
}

export function formatPrice(
  value: { toString(): string } | number | string,
  fractionDigits = 2,
) {
  return Number(value).toLocaleString("en-MY", {
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  });
}

export function formatQuotePrice(
  value: { toString(): string } | number | string,
  currency = "USD",
) {
  return `${currency} ${formatPrice(value)}`;
}
