import { notFound } from "next/navigation";
import { ReviewButtons } from "@/components/admin/ReviewButtons";
import { reviewBankAccountAction } from "@/app/actions/wallet-admin";
import { query } from "@/lib/db";
import { assetsHubEnabled } from "@/lib/feature-flags";

export const dynamic = "force-dynamic";

export default async function BankAccountsPage() {
  if (!assetsHubEnabled()) notFound();
  const rows = await query<{
    id: string; holderName: string; bankName: string; accountNo: string; status: string; fullName: string;
  }>(
    `SELECT b.\`id\`, b.\`holderName\`, b.\`bankName\`, b.\`accountNo\`, b.\`status\`, m.\`fullName\`
     FROM \`BankAccount\` b JOIN \`Member\` m ON m.\`id\`=b.\`memberId\`
     ORDER BY b.\`createdAt\` DESC LIMIT 100`,
  ).catch(() => []);

  return (
    <div>
      <h1 className="font-display text-4xl text-gold">Bank accounts</h1>
      <p className="mt-2 mb-8 text-mist">Approved accounts can be selected for a fund withdrawal.</p>
      <div className="space-y-4">
        {rows.map((row) => (
          <article key={row.id} className="rounded-xl border border-gold/20 p-6">
            <h2 className="text-lg text-gold">{row.holderName}</h2>
            <p className="mt-1 text-sm text-mist">{row.fullName} · {row.bankName} · {row.accountNo}</p>
            <p className="mt-1 text-sm capitalize text-gold">{row.status}</p>
            {row.status === "pending" ? <ReviewButtons id={row.id} action={reviewBankAccountAction} /> : null}
          </article>
        ))}
        {rows.length === 0 ? <p className="text-mist">No bank accounts yet.</p> : null}
      </div>
    </div>
  );
}
