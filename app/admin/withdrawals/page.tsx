import { notFound } from "next/navigation";
import { ReviewButtons } from "@/components/admin/ReviewButtons";
import { reviewWithdrawalAction } from "@/app/actions/wallet-admin";
import { query } from "@/lib/db";
import { assetsHubEnabled } from "@/lib/feature-flags";

export const dynamic = "force-dynamic";

export default async function WithdrawalsPage() {
  if (!assetsHubEnabled()) notFound();
  const rows = await query<{
    id: string; kind: string; amount: unknown; status: string; createdAt: Date; fullName: string; memberCode: string;
  }>(
    `SELECT w.\`id\`, w.\`kind\`, w.\`amount\`, w.\`status\`, w.\`createdAt\`, m.\`fullName\`, m.\`memberId\` AS memberCode
     FROM \`Withdrawal\` w JOIN \`Member\` m ON m.\`id\`=w.\`memberId\` ORDER BY w.\`createdAt\` DESC LIMIT 100`,
  ).catch(() => []);

  return (
    <div>
      <h1 className="font-display text-4xl text-gold">Withdrawals</h1>
      <p className="mt-2 mb-8 text-mist">The balance drops only after you approve.</p>
      <div className="space-y-4">
        {rows.map((row) => (
          <article key={row.id} className="rounded-xl border border-gold/20 p-6">
            <h2 className="text-lg text-gold">{row.kind === "xau" ? "XAU" : "Fund"} · {Number(row.amount)}</h2>
            <p className="mt-1 text-sm text-mist">{row.fullName} · {row.memberCode}</p>
            <p className="mt-1 text-sm capitalize text-gold">{row.status}</p>
            {row.status === "pending" ? <ReviewButtons id={row.id} action={reviewWithdrawalAction} /> : null}
          </article>
        ))}
        {rows.length === 0 ? <p className="text-mist">No withdrawals yet.</p> : null}
      </div>
    </div>
  );
}
