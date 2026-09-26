"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const TABS = [
  { href: "/portal", label: "Profile", match: (path: string) => path === "/portal" },
  {
    href: "/portal/history",
    label: "Purchase History",
    match: (path: string) => path.startsWith("/portal/history"),
  },
] as const;

export function PortalTabs() {
  const pathname = usePathname();

  return (
    <nav className="mt-8 flex gap-1 border-b border-white/10" aria-label="Account sections">
      {TABS.map((tab) => {
        const active = tab.match(pathname);
        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={`-mb-px border-b-2 px-4 py-3 text-sm uppercase tracking-wide transition-colors ${
              active
                ? "border-gold text-gold"
                : "border-transparent text-mist hover:text-ivory"
            }`}
          >
            {tab.label}
          </Link>
        );
      })}
    </nav>
  );
}
