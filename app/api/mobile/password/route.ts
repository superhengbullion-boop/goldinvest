import { assetsHubNotFound } from "@/lib/feature-flags";
import bcrypt from "bcryptjs";
import { execute, queryOne } from "@/lib/db";
import { badRequest, memberFromRequest, unauthorized } from "@/lib/mobile-auth";
import { readJsonObject } from "@/lib/mobile-cart";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const hidden = assetsHubNotFound();
  if (hidden) return hidden;
  const member = await memberFromRequest(request);
  if (!member) return unauthorized();
  const body = await readJsonObject(request);
  if (!body) return badRequest("Enter your current password.");
  const currentPassword = String(body.currentPassword ?? "");
  const newPassword = String(body.newPassword ?? "");
  const confirmPassword = String(body.confirmPassword ?? "");
  if (newPassword.length < 6) return badRequest("Password must be at least 6 characters.");
  if (newPassword !== confirmPassword) return badRequest("New passwords do not match.");
  const row = await queryOne<{ passwordHash: string }>("SELECT `passwordHash` FROM `Member` WHERE `id`=?", [member.id]);
  if (!row || !(await bcrypt.compare(currentPassword, row.passwordHash))) {
    return badRequest("Current password is wrong.");
  }
  await execute("UPDATE `Member` SET `passwordHash`=?,`updatedAt`=NOW(3) WHERE `id`=?", [
    await bcrypt.hash(newPassword, 12),
    member.id,
  ]);
  return Response.json({ ok: true });
}
