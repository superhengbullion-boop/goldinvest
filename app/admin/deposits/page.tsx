import { notFound } from "next/navigation";
import { DepositReviewForm } from "@/components/admin/DepositReviewForm";
import { listDeposits } from "@/lib/deposits";
import { assetsHubEnabled } from "@/lib/feature-flags";

export const dynamic = "force-dynamic";

function kindLabel(kind: string) {
  return kind === "xau" ? "XAU" : "Fund";
}

function amountLabel(kind: string, amount: number) {
  return kind === "xau" ? `${amount} g` : `RM ${amount.toFixed(2)}`;
}

export default async function AdminDepositsPage() {
  if (!assetsHubEnabled()) notFound();
  const deposits = await listDeposits().catch(() => []);

  return (
    <div>
      <h1 className="font-display text-4xl text-gold">Deposits</h1>
      <p className="mt-2 mb-8 text-mist">
        Review member deposits. The balance changes only after you approve.
      </p>

      <div className="space-y-4">
        {deposits.map((deposit) => (
          <article key={deposit.id} className="rounded-xl border border-gold/20 p-6">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <h2 className="text-lg text-gold">{kindLabel(deposit.kind)}</h2>
                <p className="mt-1 text-sm text-mist">
                  {deposit.fullName} · {deposit.memberCode} · {deposit.phone}
                </p>
                <p className="mt-1 text-xs text-mist">{deposit.createdAt.toLocaleString()}</p>
              </div>
              <div className="text-right">
                <p className="text-sm capitalize text-gold">{deposit.status}</p>
                {deposit.creditedAmount != null ? (
                  <p className="mt-1 tabular-nums">{amountLabel(deposit.kind, deposit.creditedAmount)}</p>
                ) : null}
              </div>
            </div>

            {deposit.comment ? <p className="mt-4 text-sm">{deposit.comment}</p> : null}
            {deposit.proofPath ? (
              <img
                src={deposit.proofPath}
                alt="Transfer screenshot"
                className="mt-4 max-h-80 rounded-lg border border-gold/20"
              />
            ) : null}
            {deposit.status === "pending" ? (
              <DepositReviewForm id={deposit.id} kind={deposit.kind} />
            ) : null}
          </article>
        ))}
        {deposits.length === 0 ? <p className="text-mist">No deposits yet.</p> : null}
      </div>
    </div>
  );
}
