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
