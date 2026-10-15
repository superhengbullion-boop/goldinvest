import { assetsHubNotFound } from "@/lib/feature-flags";
import { createBankAccount, listBankAccounts } from "@/lib/wallet";
import { badRequest, memberFromRequest, unauthorized } from "@/lib/mobile-auth";
import { readJsonObject } from "@/lib/mobile-cart";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const hidden = assetsHubNotFound();
  if (hidden) return hidden;
  const member = await memberFromRequest(request);
  if (!member) return unauthorized();
  const url = new URL(request.url);
  const rows = await listBankAccounts(member.id, url.searchParams.get("approved") === "1");
  return Response.json({
    accounts: rows.map((row) => ({
      id: row.id,
      holderName: row.holderName,
      bankName: row.bankName,
      accountNo: row.accountNo,
      status: row.status,
    })),
  });
}

export async function POST(request: Request) {
  const hidden = assetsHubNotFound();
  if (hidden) return hidden;
  const member = await memberFromRequest(request);
  if (!member) return unauthorized();
  const body = await readJsonObject(request);
  if (!body) return badRequest("Enter the account holder name.");
  try {
    const row = await createBankAccount(member.id, {
      holderName: String(body.holderName ?? ""),
      bankName: String(body.bankName ?? ""),
      accountNo: String(body.accountNo ?? ""),
    });
    return Response.json(row);
  } catch (error) {
    return badRequest(error instanceof Error ? error.message : "Could not save the bank account.");
  }
}
