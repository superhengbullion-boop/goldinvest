import bcrypt from "bcryptjs";
import { asBool, queryOne } from "@/lib/db";
import { badRequest, toMobileProfile } from "@/lib/mobile-auth";
import { createMemberToken, loadMember } from "@/lib/member-session";

export const dynamic = "force-dynamic";

const INVALID = "Invalid username or password.";

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return badRequest("Username and password are required.");
  }
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return badRequest("Username and password are required.");
  }

  const username = String((body as { username?: unknown }).username ?? "").trim();
  const password = String((body as { password?: unknown }).password ?? "");
  if (!username || !password) return badRequest("Username and password are required.");

  const row = await queryOne<{ id: number; passwordHash: string; isActive: unknown }>(
    "SELECT `id`,`passwordHash`,`isActive` FROM `Member` WHERE `username`=? LIMIT 1",
    [username],
  );
  if (!row || !asBool(row.isActive)) {
    return Response.json({ error: INVALID }, { status: 401 });
  }
  const valid = await bcrypt.compare(password, row.passwordHash);
  if (!valid) return Response.json({ error: INVALID }, { status: 401 });

  const member = await loadMember(row.id);
  if (!member) return Response.json({ error: INVALID }, { status: 401 });

  const { token } = await createMemberToken(member.id);
  return Response.json({ token, member: toMobileProfile(member) });
}
