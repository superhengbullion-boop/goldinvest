"use server";

import { revalidatePath } from "next/cache";
import { assetsHubEnabled } from "@/lib/feature-flags";
import { getSession } from "@/lib/session";
import { createAnnouncement, reviewBankAccount, reviewTransfer, reviewWithdrawal, setAnnouncementActive } from "@/lib/wallet";

async function requireAdmin() {
  if (!assetsHubEnabled()) throw new Error("Not found");
  const session = await getSession();
  if (!session?.userId) throw new Error("Unauthorized");
  return session;
}

function decisionOf(formData: FormData) {
  const decision = String(formData.get("decision") ?? "");
  if (decision !== "approve" && decision !== "reject") throw new Error("Choose approve or reject.");
  return decision;
}

export async function reviewBankAccountAction(formData: FormData) {
  await requireAdmin();
  await reviewBankAccount(String(formData.get("id") ?? ""), decisionOf(formData));
  revalidatePath("/admin/bank-accounts");
}

export async function reviewWithdrawalAction(formData: FormData) {
  const session = await requireAdmin();
  await reviewWithdrawal(String(formData.get("id") ?? ""), decisionOf(formData), session.userId);
  revalidatePath("/admin/withdrawals");
}

export async function reviewTransferAction(formData: FormData) {
  const session = await requireAdmin();
  await reviewTransfer(String(formData.get("id") ?? ""), decisionOf(formData), session.userId);
  revalidatePath("/admin/transfers");
}

export async function createAnnouncementAction(formData: FormData) {
  await requireAdmin();
  await createAnnouncement(String(formData.get("title") ?? ""), String(formData.get("body") ?? ""));
  revalidatePath("/admin/announcements");
}

export async function toggleAnnouncementAction(formData: FormData) {
  await requireAdmin();
  await setAnnouncementActive(String(formData.get("id") ?? ""), formData.get("isActive") !== "1");
  revalidatePath("/admin/announcements");
}
