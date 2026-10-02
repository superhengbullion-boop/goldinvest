import "server-only";
import { decryptMember } from "@/lib/session-token";
import { loadMember } from "@/lib/member-session";

export type MobileProfile = {
  memberId: string;
  username: string;
  fullName: string;
  phone: string;
  email: string;
  rateBookAssigned: boolean;
};

type LoadedMember = NonNullable<Awaited<ReturnType<typeof loadMember>>>;

export function toMobileProfile(member: LoadedMember): MobileProfile {
  return {
    memberId: member.memberId,
    username: member.username,
    fullName: member.fullName,
    phone: member.phone,
    email: member.email,
    rateBookAssigned: Boolean(member.rateBook?.isActive),
  };
}

export async function memberFromRequest(request: Request) {
  const header = request.headers.get("authorization");
  if (!header) return null;
  const match = /^Bearer\s+(\S+)$/i.exec(header.trim());
  if (!match) return null;
  const payload = await decryptMember(match[1]);
  if (!payload) return null;
  return loadMember(payload.memberId);
}

export function unauthorized(error = "Unauthorized.") {
  return Response.json({ error }, { status: 401 });
}

export function badRequest(error: string) {
  return Response.json({ error }, { status: 400 });
}
