import { notFound } from "next/navigation";
import { createAnnouncementAction, toggleAnnouncementAction } from "@/app/actions/wallet-admin";
import { listAnnouncements } from "@/lib/wallet";
import { asBool } from "@/lib/db";
import { assetsHubEnabled } from "@/lib/feature-flags";

export const dynamic = "force-dynamic";

export default async function AnnouncementsPage() {
  if (!assetsHubEnabled()) notFound();
  const rows = await listAnnouncements(false).catch(() => []);

  return (
    <div>
      <h1 className="font-display text-4xl text-gold">Announcements</h1>
      <p className="mt-2 mb-8 text-mist">Active announcements show on the bell in the app.</p>
      <form action={createAnnouncementAction} className="mb-10 max-w-xl space-y-4">
        <input name="title" placeholder="Title" required className="w-full rounded-lg border border-gold/30 bg-ink px-4 py-3" />
        <textarea name="body" placeholder="Message" required rows={4} className="w-full rounded-lg border border-gold/30 bg-ink px-4 py-3" />
        <button className="gold-btn py-2">Publish</button>
      </form>
      <div className="space-y-4">
        {rows.map((row) => (
          <article key={row.id} className="rounded-xl border border-gold/20 p-6">
            <h2 className="text-lg text-gold">{row.title}</h2>
            <p className="mt-2 whitespace-pre-wrap text-sm">{row.body}</p>
            <form action={toggleAnnouncementAction} className="mt-4">
              <input type="hidden" name="id" value={row.id} />
              <input type="hidden" name="isActive" value={asBool(row.isActive) ? "1" : "0"} />
              <button className="text-sm text-mist hover:text-gold">{asBool(row.isActive) ? "Hide" : "Show"}</button>
            </form>
          </article>
        ))}
      </div>
    </div>
  );
}
