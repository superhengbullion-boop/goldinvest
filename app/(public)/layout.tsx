import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { RateTicker } from "@/components/RateTicker";
import { getMetalQuotes } from "@/lib/data";
import { getMember } from "@/lib/member-session";
import { tickerItems } from "@/lib/metal-quotes";

export const dynamic = "force-dynamic";

export default async function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [quotes, member] = await Promise.all([getMetalQuotes(), getMember()]);
  const book = member?.rateBook?.isActive ? member.rateBook : null;
  const rates = book ? tickerItems(quotes, book.adjustments) : [];

  return (
    <>
      <RateTicker rates={rates} />
      <SiteHeader accountName={member?.fullName ?? null} />
      <main className="flex-1">{children}</main>
      <SiteFooter />
    </>
  );
}
