import bcrypt from "bcryptjs";
import { execute, queryOne } from "@/lib/db";

export async function saveMemberProfile(input: {
  id: number;
  username: string;
  fullName: string;
  password: string;
  confirmPassword: string;
}): Promise<{ error: string } | { ok: true }> {
  const username = input.username.trim();
  const fullName = input.fullName.trim();
  const password = input.password;
  const confirm = input.confirmPassword;

  if (!username || !fullName) return { error: "Username and full name are required." };
  if (username.length < 3) return { error: "Username must be at least 3 characters." };
  if (password && password !== confirm) return { error: "New passwords do not match." };
  if (password && password.length < 6) return { error: "Password must be at least 6 characters." };

  const taken = await queryOne<{ id: number }>(
    "SELECT `id` FROM `Member` WHERE `username`=? AND `id`<>? LIMIT 1",
    [username, input.id],
  );
  if (taken) return { error: "That username is already taken." };

  if (password) {
    await execute(
      "UPDATE `Member` SET `username`=?,`fullName`=?,`passwordHash`=?,`updatedAt`=NOW(3) WHERE `id`=?",
      [username, fullName, await bcrypt.hash(password, 12), input.id],
    );
  } else {
    await execute(
      "UPDATE `Member` SET `username`=?,`fullName`=?,`updatedAt`=NOW(3) WHERE `id`=?",
      [username, fullName, input.id],
    );
  }
  return { ok: true };
}

export async function savePersonalDetails(input: {
  id: number;
  email: string;
  fullName: string;
  phone: string;
  address: string;
  companyName: string;
  registrationNo: string;
}) {
  const email = input.email.trim().toLowerCase();
  const fullName = input.fullName.trim();
  const phone = input.phone.trim();
  const address = input.address.trim().slice(0, 191);
  const companyName = input.companyName.trim().slice(0, 191);
  const registrationNo = input.registrationNo.trim().slice(0, 191);
  if (!email.includes("@")) return { error: "Enter a valid email." };
  if (!fullName || fullName.length > 120) return { error: "Enter your name." };
  if (!phone || phone.length > 40) return { error: "Enter your phone." };
  const taken = await queryOne<{ id: number }>(
    "SELECT `id` FROM `Member` WHERE `email`=? AND `id`<>? LIMIT 1",
    [email, input.id],
  );
  if (taken) return { error: "That email is already used." };
  await execute(
    "UPDATE `Member` SET `email`=?,`fullName`=?,`phone`=?,`address`=?,`companyName`=?,`registrationNo`=?,`updatedAt`=NOW(3) WHERE `id`=?",
    [email, fullName, phone, address, companyName, registrationNo, input.id],
  );
  return { ok: true as const };
}

export async function saveLocale(id: number, locale: string) {
  if (locale !== "en" && locale !== "zh-Hant") return { error: "Choose English or Traditional Chinese." };
  await execute("UPDATE `Member` SET `locale`=?,`updatedAt`=NOW(3) WHERE `id`=?", [locale, id]);
  return { ok: true as const };
}
