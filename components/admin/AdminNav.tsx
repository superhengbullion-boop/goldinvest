"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { logout } from "@/app/actions/auth";

const GROUPS = [
  {
    label: "Business",
    links: [
      { href: "/admin", label: "Dashboard", exact: true },
      { href: "/admin/members", label: "Members" },
      { href: "/admin/orders", label: "Orders" },
      { href: "/admin/messages", label: "Messages" },
    ],
  },
  {
    label: "Rates",
    links: [
      { href: "/admin/rates", label: "Rate books" },
      { href: "/admin/pages/rates", label: "Rates page" },
    ],
  },
  {
    label: "Website",
    links: [
      { href: "/admin/pages/home", label: "Home" },
      { href: "/admin/pages/about", label: "About" },
      { href: "/admin/pages/terms", label: "Terms" },
      { href: "/admin/pages/contact", label: "Contact" },
      { href: "/admin/settings", label: "Site settings" },
    ],
  },
  {
    label: "Mobile app",
    links: [{ href: "/admin/app", label: "App content" }],
  },
];

export function AdminNav({
  unreadCount = 0,
  pendingOrderCount = 0,
}: {
  unreadCount?: number;
  pendingOrderCount?: number;
}) {
  const current = usePathname();
  return (
    <aside className="flex w-64 flex-col border-r border-gold/20 bg-black px-5 py-8">
      <Link href="/admin" className="font-display text-2xl text-gold">
        Super Heng Bullion
      </Link>
      <p className="mt-1 text-xs uppercase tracking-[0.2em] text-mist">Admin</p>
      <nav className="mt-8 flex flex-1 flex-col gap-6 overflow-y-auto">
        {GROUPS.map((group) => (
          <div key={group.label}>
            <p className="px-3 text-xs uppercase tracking-[0.16em] text-mist">{group.label}</p>
            <div className="mt-2 flex flex-col gap-1">
              {group.links.map((link) => {
                const active = link.exact
                  ? current === link.href
                  : current === link.href || current.startsWith(`${link.href}/`);
                const badge =
                  link.href === "/admin/messages"
                    ? unreadCount
                    : link.href === "/admin/orders"
                      ? pendingOrderCount
                      : 0;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`flex items-center justify-between gap-2 rounded-lg px-3 py-2 text-sm ${
                      active ? "bg-gold text-white" : "text-ivory hover:bg-ink-3 hover:text-gold"
                    }`}
                  >
                    <span>{link.label}</span>
                    {badge > 0 ? (
                      <span
                        className={`min-w-5 rounded-full px-1.5 py-0.5 text-center text-xs font-semibold tabular-nums ${
                          active ? "bg-black text-gold" : "bg-gold text-black"
                        }`}
                      >
                        {badge > 99 ? "99+" : badge}
                      </span>
                    ) : null}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>
      <Link href="/" className="mb-3 text-sm text-mist hover:text-gold">
        View site
      </Link>
      <form action={logout}>
        <button type="submit" className="text-sm text-mist hover:text-gold">
          Sign out
        </button>
      </form>
    </aside>
  );
}
