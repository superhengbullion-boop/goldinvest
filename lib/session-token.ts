import { jwtVerify, SignJWT } from "jose";
import type { MemberPayload, SessionPayload } from "@/lib/types";

const encodedKey = new TextEncoder().encode(
  process.env.SESSION_SECRET ?? "dev-only-change-me-in-production-32b",
);

export async function encrypt(payload: SessionPayload) {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(encodedKey);
}

export async function decrypt(session: string | undefined = "") {
  if (!session) return null;
  try {
    const { payload } = await jwtVerify(session, encodedKey, {
      algorithms: ["HS256"],
    });
    return payload as SessionPayload;
  } catch {
    return null;
  }
}

export async function encryptMember(payload: MemberPayload) {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(encodedKey);
}

export async function decryptMember(session: string | undefined = "") {
  if (!session) return null;
  try {
    const { payload } = await jwtVerify(session, encodedKey, {
      algorithms: ["HS256"],
    });
    const memberId = Number(payload.memberId);
    if (!Number.isInteger(memberId) || memberId < 1) return null;
    return { memberId, expiresAt: String(payload.expiresAt ?? "") } satisfies MemberPayload;
  } catch {
    return null;
  }
}
