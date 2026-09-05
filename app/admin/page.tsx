import Link from "next/link";
import { getMessages, getPages, getUnreadMessageCount } from "@/lib/data";
import { PAGE_META, isPageSlug } from "@/lib/cms";
import { prisma } from "@/lib/prisma";

export default async function AdminHome() {
  const [pages, unread, latestQuote, memberCount] = await Promise.all([
    getPages(),
    getUnreadMessageCount(),
    prisma.metalQuote.findFirst({
      orderBy: { fetchedAt: "desc" },
      select: { fetchedAt: true },
    }),
    prisma.member.count(),
  ]);
  const messages = await getMessages();

  return (
    <div>
      <h1 className="font-display text-4xl text-gold">Dashboard</h1>
      <p className="mt-2 text-mist">Edit public pages, rates, and enquiries.</p>

      <div className="mt-8 grid grid-cols-4 gap-6 max-md:grid-cols-1">
        <div className="rounded-xl border border-gold/25 p-6">
          <p className="text-sm text-mist">CMS pages</p>
          <p className="mt-2 font-display text-4xl">{pages.length}</p>
        </div>
        <Link href="/admin/members" className="rounded-xl border border-gold/25 p-6 hover:border-gold">
          <p className="text-sm text-mist">Members</p>
          <p className="mt-2 font-display text-4xl">{memberCount}</p>
        </Link>
        <div className="rounded-xl border border-gold/25 p-6">
          <p className="text-sm text-mist">Last rate update</p>
          <p className="mt-2 font-display text-2xl">
            {latestQuote
              ? latestQuote.fetchedAt.toLocaleString("en-MY", {
                  timeZone: "Asia/Kuala_Lumpur",
                  day: "numeric",
                  month: "short",
                  hour: "2-digit",
                  minute: "2-digit",
                })
              : "Never"}
          </p>
        </div>
        <div className="rounded-xl border border-gold/25 p-6">
          <p className="text-sm text-mist">Unread messages</p>
          <p className="mt-2 font-display text-4xl">{unread}</p>
        </div>
      </div>

      <h2 className="mt-12 font-display text-2xl">Pages</h2>
      <div className="mt-4 divide-y divide-gold/15 rounded-xl border border-gold/25">
        {pages.map((page) => {
          const label = isPageSlug(page.slug) ? PAGE_META[page.slug].cmsLabel : page.title;
          return (
            <Link
              key={page.id}
              href={`/admin/pages/${page.slug}`}
              className="flex items-center justify-between px-5 py-4 hover:bg-ink-2"
            >
              <span>{label}</span>
              <span className="text-sm text-gold">Edit</span>
            </Link>
          );
        })}
      </div>

      <h2 className="mt-12 font-display text-2xl">Recent messages</h2>
      <div className="mt-4 space-y-3">
        {messages.slice(0, 5).map((msg) => (
          <div key={msg.id} className="rounded-xl border border-gold/20 px-5 py-4">
            <p className="font-medium">
              {msg.name}{" "}
              {!msg.read ? <span className="text-xs text-gold">NEW</span> : null}
            </p>
            <p className="text-sm text-mist">{msg.email}</p>
            <p className="mt-2 line-clamp-2 text-sm">{msg.message}</p>
          </div>
        ))}
        {messages.length === 0 ? (
          <p className="text-mist">No enquiries yet.</p>
        ) : null}
      </div>
    </div>
  );
}
