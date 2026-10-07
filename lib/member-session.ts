import "server-only";
import { cookies } from "next/headers";
import { decryptMember, encryptMember } from "@/lib/session-token";
import { asBool, query, queryOne } from "@/lib/db";
import type { MemberAdjRow, MemberRow, RateBookAdjRow, RateBookRow } from "@/lib/data";
import { hasMemberOverrides, mergeAdjustments, type RateAdj } from "@/lib/metal-quotes";

const COOKIE = "member_session";
const SESSION_MS = 7 * 24 * 60 * 60 * 1000;

export async function createMemberToken(memberId: number) {
  const expiresAt = new Date(Date.now() + SESSION_MS);
  const token = await encryptMember({ memberId, expiresAt: expiresAt.toISOString() });
  return { token, expiresAt };
}

export async function createMemberSession(memberId: number) {
  const { token, expiresAt } = await createMemberToken(memberId);
  const cs = await cookies();
  cs.set(COOKIE, token, {
    httpOnly: true, secure: process.env.NODE_ENV === "production",
    expires: expiresAt, sameSite: "lax", path: "/",
  });
}

export async function deleteMemberSession() {
  (await cookies()).delete(COOKIE);
}

export function memberEffectiveAdjustments(
  rateBook: RateBookRow | null | undefined,
  adjustments: MemberAdjRow[] = [],
): { adjustments: RateAdj[]; assigned: boolean } {
  const book = rateBook?.isActive ? rateBook : null;
  const bookAdjs = book
    ? book.adjustments.map((item) => ({
        metal: item.metal,
        unitKey: item.unitKey,
        buyDelta: Number(item.buyDelta),
        sellDelta: Number(item.sellDelta),
      }))
    : [];
  const overrides = adjustments.map((item) => ({
    metal: item.metal,
    unitKey: item.unitKey,
    buyDelta: item.buyDelta,
    sellDelta: item.sellDelta,
  }));
  const assigned = Boolean(book) || hasMemberOverrides(overrides);
  return {
    adjustments: mergeAdjustments(bookAdjs, overrides),
    assigned,
  };
}

export async function loadMember(memberId: number) {
  const member = await queryOne<MemberRow & { isActive: unknown }>(
    "SELECT * FROM `Member` WHERE `id`=? LIMIT 1", [memberId],
  ).catch((e) => { console.error("[member] lookup failed:", e); return null; });

  if (!member || !asBool(member.isActive)) return null;

  let rateBook: RateBookRow | null = null;
  if (member.rateBookId) {
    const book = await queryOne<Omit<RateBookRow, "adjustments"> & { isActive: unknown }>(
      "SELECT * FROM `RateBook` WHERE `id`=? LIMIT 1", [member.rateBookId],
    );
    if (book) {
      const adjs = await query<RateBookAdjRow>(
        "SELECT * FROM `RateBookAdj` WHERE `bookId`=?", [book.id],
      );
      rateBook = { ...book, isActive: asBool(book.isActive), adjustments: adjs };
    }
  }

  const adjustments = await query<MemberAdjRow>(
    "SELECT * FROM `MemberAdj` WHERE `memberId`=?",
    [memberId],
  ).catch(() => [] as MemberAdjRow[]);

  return { ...member, isActive: true as const, rateBook, adjustments };
}

export async function getMember() {
  const cs = await cookies();
  const payload = await decryptMember(cs.get(COOKIE)?.value);
  if (!payload) return null;

  const member = await loadMember(payload.memberId);
  if (!member) {
    await deleteMemberSession();
    return null;
  }
  return member;
}
