import { AdminNav } from "@/components/admin/AdminNav";
import { getUnreadMessageCount } from "@/lib/data";
import { getPendingOrderCount } from "@/lib/orders";
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

  const [unreadCount, pendingOrderCount] = await Promise.all([
    getUnreadMessageCount(),
    getPendingOrderCount().catch(() => 0),
  ]);

  return (
    <div className="flex min-h-screen bg-ink text-ivory">
      <AdminNav unreadCount={unreadCount} pendingOrderCount={pendingOrderCount} />
      <div className="flex-1 overflow-auto p-10">{children}</div>
    </div>
  );
}
