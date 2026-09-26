import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { LiveRateTicker } from "@/components/LiveRateTicker";
import { MarketRatesProvider } from "@/components/MarketRatesProvider";
import { getSiteSettings } from "@/lib/data";
import { getMember } from "@/lib/member-session";
import { getCartItemCount } from "@/lib/orders";

export const dynamic = "force-dynamic";

export default async function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [member, site] = await Promise.all([getMember(), getSiteSettings()]);
  const showTicker = Boolean(member?.rateBook?.isActive);
  const cartCount = member
    ? await getCartItemCount(member.id).catch(() => 0)
    : 0;

  return (
    <MarketRatesProvider enabled={showTicker}>
      <LiveRateTicker />
      <SiteHeader
        accountName={member?.fullName ?? null}
        cartCount={cartCount}
        logo={site.logo}
        siteName={site.siteName}
      />
      <main className="flex-1">{children}</main>
      <SiteFooter siteName={site.siteName} />
    </MarketRatesProvider>
  );
}
