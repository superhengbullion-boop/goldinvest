import "server-only";

import { cookies } from "next/headers";
import { decryptMember, encryptMember } from "@/lib/session-token";
import { prisma } from "@/lib/prisma";

const COOKIE = "member_session";

export async function createMemberSession(memberId: number) {
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  const token = await encryptMember({ memberId, expiresAt: expiresAt.toISOString() });
  const cookieStore = await cookies();
  cookieStore.set(COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    expires: expiresAt,
    sameSite: "lax",
    path: "/",
  });
}

export async function deleteMemberSession() {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE);
}

export async function getMember() {
  const cookieStore = await cookies();
  const payload = await decryptMember(cookieStore.get(COOKIE)?.value);
  if (!payload) return null;

  const member = await prisma.member.findUnique({
    where: { id: payload.memberId },
    include: { rateBook: { include: { adjustments: true } } },
  });
  if (!member?.isActive) {
    await deleteMemberSession();
    return null;
  }
  return member;
}
