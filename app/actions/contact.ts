"use server";
import { revalidatePath } from "next/cache";
import { execute, newId } from "@/lib/db";
import { verifyRecaptchaToken } from "@/lib/recaptcha";
import { notifyTelegramContact } from "@/lib/telegram";

export type ContactFormState =
  | { ok: true; message: string }
  | { ok: false; message: string }
  | undefined;

export async function submitContact(
  _state: ContactFormState,
  formData: FormData,
): Promise<ContactFormState> {
  const name    = String(formData.get("name")    ?? "").trim();
  const email   = String(formData.get("email")   ?? "").trim();
  const phone   = String(formData.get("phone")   ?? "").trim();
  const message = String(formData.get("message") ?? "").trim();

  if (!name || !email || !phone || !message) {
    return { ok: false, message: "Please complete all fields." };
  }

  const captcha = await verifyRecaptchaToken(
    String(formData.get("recaptchaToken") ?? ""), "contact",
  );
  if (!captcha.ok) return captcha;

  await execute(
    "INSERT INTO `ContactMessage`(`id`,`name`,`email`,`phone`,`message`,`read`,`createdAt`) VALUES(?,?,?,?,?,0,NOW(3))",
    [newId(), name, email, phone, message],
  );

  try { await notifyTelegramContact({ name, email, phone, message }); }
  catch (e) { console.error("[telegram] notify failed", e); }

  revalidatePath("/admin/messages");
  revalidatePath("/admin", "layout");
  return { ok: true, message: "Thank you. We will get back to you shortly." };
}
