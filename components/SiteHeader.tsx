"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { memberLogout } from "@/app/actions/member-auth";
import { Logo } from "@/components/Logo";
import { NAV_LINKS } from "@/lib/cms";

export function SiteHeader({
  accountName,
}: {
  accountName?: string | null;
}) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const accountLinks = accountName
    ? [{ href: "/portal", label: "My account" }]
    : [{ href: "/login", label: "Login" }];

  return (
    <header className="relative z-40">
      <div className="flex items-center justify-between px-[5%] py-4 lg:hidden">
        <Logo />
        <button
          type="button"
          aria-label="Open menu"
          className="p-3 text-ivory"
          onClick={() => setOpen((v) => !v)}
        >
          <span className="mb-1.5 block h-0.5 w-6 bg-gold" />
          <span className="mb-1.5 block h-0.5 w-6 bg-gold" />
          <span className="block h-0.5 w-6 bg-gold" />
        </button>
      </div>

      {open ? (
        <nav className="absolute inset-x-0 top-full z-50 border-t border-gold/20 bg-ink px-[5%] py-4 lg:hidden">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setOpen(false)}
              className={`block py-3 uppercase tracking-wide ${
                pathname === link.href ? "text-gold" : "text-ivory hover:text-gold"
              }`}
            >
              {link.label}
            </Link>
          ))}
          {accountLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setOpen(false)}
              className={`block py-3 uppercase tracking-wide ${
                pathname === link.href ? "text-gold" : "text-ivory hover:text-gold"
              }`}
            >
              {link.label}
            </Link>
          ))}
          {accountName ? (
            <form action={memberLogout}>
              <button type="submit" className="block py-3 uppercase tracking-wide text-ivory hover:text-gold">
                Sign out
              </button>
            </form>
          ) : null}
        </nav>
      ) : null}

      <div className="hidden items-center px-[5%] py-4 lg:flex">
        <Logo className="shrink-0" />
        <nav className="flex min-w-0 flex-1 items-center justify-center gap-10 uppercase tracking-wide">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`p-4 text-[1rem] whitespace-nowrap hover:text-gold ${
                pathname === link.href ? "text-gold" : "text-ivory"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </nav>
        <div className="flex shrink-0 items-center justify-end gap-6 text-sm uppercase tracking-wide whitespace-nowrap">
          {accountName ? (
            <>
              <Link href="/portal" className={pathname === "/portal" ? "text-gold" : "hover:text-gold"}>
                Account
              </Link>
              <form action={memberLogout}>
                <button type="submit" className="px-1 py-1 hover:text-gold">
                  Sign out
                </button>
              </form>
            </>
          ) : (
            <Link href="/login" className={pathname === "/login" ? "text-gold" : "hover:text-gold"}>
              Login
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
