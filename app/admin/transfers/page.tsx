import { notFound } from "next/navigation";
import { ReviewButtons } from "@/components/admin/ReviewButtons";
import { reviewTransferAction } from "@/app/actions/wallet-admin";
import { query } from "@/lib/db";
import { assetsHubEnabled } from "@/lib/feature-flags";

export const dynamic = "force-dynamic";

export default async function TransfersPage() {
  if (!assetsHubEnabled()) notFound();
  const rows = await query<{
    id: string; grams: unknown; status: string; fromName: string; toName: string;
  }>(
    `SELECT t.\`id\`, t.\`grams\`, t.\`status\`, s.\`username\` AS fromName, r.\`username\` AS toName
     FROM \`GoldTransfer\` t
     JOIN \`Member\` s ON s.\`id\`=t.\`fromMemberId\`
     JOIN \`Member\` r ON r.\`id\`=t.\`toMemberId\`
     ORDER BY t.\`createdAt\` DESC LIMIT 100`,
  ).catch(() => []);

  return (
    <div>
      <h1 className="font-display text-4xl text-gold">Transfers</h1>
      <p className="mt-2 mb-8 text-mist">Gold moves only after you approve.</p>
      <div className="space-y-4">
        {rows.map((row) => (
          <article key={row.id} className="rounded-xl border border-gold/20 p-6">
            <h2 className="text-lg text-gold">{Number(row.grams)} g</h2>
            <p className="mt-1 text-sm text-mist">{row.fromName} → {row.toName}</p>
            <p className="mt-1 text-sm capitalize text-gold">{row.status}</p>
            {row.status === "pending" ? <ReviewButtons id={row.id} action={reviewTransferAction} /> : null}
          </article>
        ))}
        {rows.length === 0 ? <p className="text-mist">No transfers yet.</p> : null}
      </div>
    </div>
  );
}
