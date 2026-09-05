"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { logout } from "@/app/actions/auth";
import { PAGE_META } from "@/lib/cms";

const LINKS = [
  { href: "/admin", label: "Dashboard" },
  ...Object.entries(PAGE_META).map(([slug, meta]) => ({
    href: `/admin/pages/${slug}`,
    label: meta.cmsLabel,
  })),
  { href: "/admin/rates", label: "Rates Setting" },
  { href: "/admin/members", label: "Members" },
  { href: "/admin/messages", label: "Messages" },
];

export function AdminNav({ unreadCount = 0 }: { unreadCount?: number }) {
  const current = usePathname();
  return (
    <aside className="flex w-64 flex-col border-r border-gold/20 bg-black px-5 py-8">
      <Link href="/admin" className="font-display text-2xl text-gold">
        Super Heng Bullion
      </Link>
      <p className="mt-1 text-xs uppercase tracking-[0.2em] text-mist">CMS</p>
      <nav className="mt-8 flex flex-1 flex-col gap-1">
        {LINKS.map((link) => {
          const active =
            current === link.href ||
            (link.href !== "/admin" && current.startsWith(link.href));
          const showUnread = link.href === "/admin/messages" && unreadCount > 0;
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`flex items-center justify-between gap-2 rounded-lg px-3 py-2 text-sm ${
                active
                  ? "bg-gold text-white"
                  : "text-ivory hover:bg-ink-3 hover:text-gold"
              }`}
            >
              <span>{link.label}</span>
              {showUnread ? (
                <span
                  className={`min-w-5 rounded-full px-1.5 py-0.5 text-center text-xs font-semibold tabular-nums ${
                    active ? "bg-black text-gold" : "bg-gold text-black"
                  }`}
                >
                  {unreadCount > 99 ? "99+" : unreadCount}
                </span>
              ) : null}
            </Link>
          );
        })}
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
