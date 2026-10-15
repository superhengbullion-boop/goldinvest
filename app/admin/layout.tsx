import { AdminNav } from "@/components/admin/AdminNav";
import { getUnreadMessageCount } from "@/lib/data";
import { getPendingDepositCount } from "@/lib/deposits";
import { assetsHubEnabled } from "@/lib/feature-flags";
import { getPendingOrderCount } from "@/lib/orders";
import { getPendingWithdrawalCount } from "@/lib/wallet";
import { getSession } from "@/lib/session";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();
  if (!session) {
    return children;
  }

  const assetsHub = assetsHubEnabled();
  const [unreadCount, pendingOrderCount, pendingDepositCount, pendingWithdrawalCount] = await Promise.all([
    getUnreadMessageCount(),
    getPendingOrderCount().catch(() => 0),
    assetsHub ? getPendingDepositCount().catch(() => 0) : 0,
    assetsHub ? getPendingWithdrawalCount().catch(() => 0) : 0,
  ]);

  return (
    <div className="flex min-h-screen bg-ink text-ivory">
      <AdminNav
        unreadCount={unreadCount}
        pendingOrderCount={pendingOrderCount}
        pendingDepositCount={pendingDepositCount}
        pendingWithdrawalCount={pendingWithdrawalCount}
        assetsHub={assetsHub}
      />
      <div className="flex-1 overflow-auto p-10">{children}</div>
    </div>
  );
}
