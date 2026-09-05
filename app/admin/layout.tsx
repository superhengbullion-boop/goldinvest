import { AdminNav } from "@/components/admin/AdminNav";
import { getUnreadMessageCount } from "@/lib/data";
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

  const unreadCount = await getUnreadMessageCount();

  return (
    <div className="flex min-h-screen bg-ink text-ivory">
      <AdminNav unreadCount={unreadCount} />
      <div className="flex-1 overflow-auto p-10">{children}</div>
    </div>
  );
}
