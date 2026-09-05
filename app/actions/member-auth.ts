"use server";

import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import {
  createMemberSession,
  deleteMemberSession,
  getMember,
} from "@/lib/member-session";
import type { AuthFormState } from "@/lib/types";

export type ProfileFormState = { error?: string; ok?: string } | undefined;

function safeNext(value: string | null) {
  if (value === "/rates" || value === "/portal" || value?.startsWith("/portal/")) {
    return value;
  }
  return "/portal";
}

export async function memberLogin(
  _state: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const username = String(formData.get("username") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const next = safeNext(String(formData.get("next") ?? ""));

  if (!username || !password) {
    return { error: "Username and password are required." };
  }

  const member = await prisma.member.findFirst({
    where: { username, isActive: true },
  });
  if (!member) {
    return { error: "Invalid username or password." };
  }

  const valid = await bcrypt.compare(password, member.passwordHash);
  if (!valid) {
    return { error: "Invalid username or password." };
  }

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
  if (!member) {
    redirect("/login");
  }

  const username = String(formData.get("username") ?? "").trim();
  const fullName = String(formData.get("fullName") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const confirm = String(formData.get("confirmPassword") ?? "");

  if (!username || !fullName) {
    return { error: "Username and full name are required." };
  }
  if (username.length < 3) {
    return { error: "Username must be at least 3 characters." };
  }
  if (password && password !== confirm) {
    return { error: "New passwords do not match." };
  }
  if (password && password.length < 6) {
    return { error: "Password must be at least 6 characters." };
  }

  const taken = await prisma.member.findFirst({
    where: { username, NOT: { id: member.id } },
  });
  if (taken) {
    return { error: "That username is already taken." };
  }

  await prisma.member.update({
    where: { id: member.id },
    data: {
      username,
      fullName,
      ...(password ? { passwordHash: await bcrypt.hash(password, 12) } : {}),
    },
  });

  return { ok: "Profile updated." };
}
