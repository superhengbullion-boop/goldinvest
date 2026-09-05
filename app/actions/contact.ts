"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
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
  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const phone = String(formData.get("phone") ?? "").trim();
  const message = String(formData.get("message") ?? "").trim();

  if (!name || !email || !phone || !message) {
    return { ok: false, message: "Please complete all fields." };
  }

  const captcha = await verifyRecaptchaToken(
    String(formData.get("recaptchaToken") ?? ""),
    "contact",
  );
  if (!captcha.ok) return captcha;

  await prisma.contactMessage.create({
    data: { name, email, phone, message },
  });

  try {
    await notifyTelegramContact({ name, email, phone, message });
  } catch (error) {
    console.error("[telegram] notify failed", error);
  }

  revalidatePath("/admin/messages");
  revalidatePath("/admin", "layout");
  return { ok: true, message: "Thank you. We will get back to you shortly." };
}
