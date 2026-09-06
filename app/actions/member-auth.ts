"use server";
import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";
import { asBool, execute, queryOne } from "@/lib/db";
import { createMemberSession, deleteMemberSession, getMember } from "@/lib/member-session";
import type { AuthFormState } from "@/lib/types";

export type ProfileFormState = { error?: string; ok?: string } | undefined;

function safeNext(v: string | null) {
  if (v === "/rates" || v === "/portal" || v?.startsWith("/portal/")) return v;
  return "/portal";
}

export async function memberLogin(
  _state: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const username = String(formData.get("username") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const next     = safeNext(String(formData.get("next") ?? ""));
  if (!username || !password) return { error: "Username and password are required." };

  const member = await queryOne<{ id: number; passwordHash: string; isActive: unknown }>(
    "SELECT `id`,`passwordHash`,`isActive` FROM `Member` WHERE `username`=? LIMIT 1", [username],
  );
  if (!member || !asBool(member.isActive)) return { error: "Invalid username or password." };
  const valid = await bcrypt.compare(password, member.passwordHash);
  if (!valid) return { error: "Invalid username or password." };

  await createMemberSession(member.id);
  redirect(next);
}

export async function memberLogout() {
  await deleteMemberSession();
  redirect("/");
}

export async function updateMemberProfile(
  _state: ProfileFormState,
  formData: FormData,
): Promise<ProfileFormState> {
  const member = await getMember();
  if (!member) redirect("/login");

  const username = String(formData.get("username")        ?? "").trim();
  const fullName = String(formData.get("fullName")        ?? "").trim();
  const password = String(formData.get("password")        ?? "");
  const confirm  = String(formData.get("confirmPassword") ?? "");

  if (!username || !fullName) return { error: "Username and full name are required." };
  if (username.length < 3)    return { error: "Username must be at least 3 characters." };
  if (password && password !== confirm) return { error: "New passwords do not match." };
  if (password && password.length < 6) return { error: "Password must be at least 6 characters." };

  const taken = await queryOne<{ id: number }>(
    "SELECT `id` FROM `Member` WHERE `username`=? AND `id`<>? LIMIT 1", [username, member.id],
  );
  if (taken) return { error: "That username is already taken." };

  if (password) {
    await execute(
      "UPDATE `Member` SET `username`=?,`fullName`=?,`passwordHash`=?,`updatedAt`=NOW(3) WHERE `id`=?",
      [username, fullName, await bcrypt.hash(password, 12), member.id],
    );
  } else {
    await execute(
      "UPDATE `Member` SET `username`=?,`fullName`=?,`updatedAt`=NOW(3) WHERE `id`=?",
      [username, fullName, member.id],
    );
  }
  return { ok: "Profile updated." };
}
