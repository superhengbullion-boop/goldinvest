"use server";
import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";
import { asBool, queryOne } from "@/lib/db";
import { saveMemberProfile } from "@/lib/member-profile";
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

  const result = await saveMemberProfile({
    id: member.id,
    username: String(formData.get("username") ?? ""),
    fullName: String(formData.get("fullName") ?? ""),
    password: String(formData.get("password") ?? ""),
    confirmPassword: String(formData.get("confirmPassword") ?? ""),
  });
  if ("error" in result) return result;
  return { ok: "Profile updated." };
}
