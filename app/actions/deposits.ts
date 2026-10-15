"use server";

import { revalidatePath } from "next/cache";
import { execute, newId } from "@/lib/db";
import {
  DEPOSIT_SETTINGS_SLUG,
  normalizeDepositSettings,
} from "@/lib/deposit-settings";
import { reviewDeposit } from "@/lib/deposits";
import { assetsHubEnabled } from "@/lib/feature-flags";
import { getSession } from "@/lib/session";

async function requireAdmin() {
  if (!assetsHubEnabled()) throw new Error("Not found");
  const session = await getSession();
  if (!session?.userId) throw new Error("Unauthorized");
  return session;
}

export async function updateDepositSettings(formData: FormData) {
  await requireAdmin();
  const content = normalizeDepositSettings({
    infoHeading: String(formData.get("infoHeading") ?? ""),
    supportPhone: String(formData.get("supportPhone") ?? ""),
    accountHolderName: String(formData.get("accountHolderName") ?? ""),
    bankName: String(formData.get("bankName") ?? ""),
    bankAccount: String(formData.get("bankAccount") ?? ""),
    fundInstructions: String(formData.get("fundInstructions") ?? ""),
    xauInstructions: String(formData.get("xauInstructions") ?? ""),
  });
  await execute(
    `INSERT INTO \`Page\`(\`id\`,\`slug\`,\`title\`,\`description\`,\`content\`,\`createdAt\`,\`updatedAt\`)
     VALUES(?,?,?,?,?,NOW(3),NOW(3))
     ON DUPLICATE KEY UPDATE \`content\`=VALUES(\`content\`),\`updatedAt\`=NOW(3)`,
    [newId(), DEPOSIT_SETTINGS_SLUG, "Deposit info", "Mobile deposit bank details and instructions", JSON.stringify(content)],
  );
  revalidatePath("/admin/deposit-info");
}

export async function reviewDepositAction(formData: FormData) {
  const session = await requireAdmin();
  const id = String(formData.get("id") ?? "");
  const decision = String(formData.get("decision") ?? "");
  if (decision !== "approve" && decision !== "reject") throw new Error("Choose approve or reject.");
  const rawAmount = String(formData.get("amount") ?? "").trim();
  const amount = rawAmount === "" ? null : Number(rawAmount);
  await reviewDeposit({
    id,
    decision,
    amount: amount != null && Number.isFinite(amount) ? amount : null,
    reviewerId: session.userId,
  });
  revalidatePath("/admin/deposits");
}
