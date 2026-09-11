import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { LiveRateTicker } from "@/components/LiveRateTicker";
import { MarketRatesProvider } from "@/components/MarketRatesProvider";
import { getMember } from "@/lib/member-session";

export const dynamic = "force-dynamic";

export default async function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const member = await getMember();
  const showTicker = Boolean(member?.rateBook?.isActive);

  return (
    <MarketRatesProvider enabled={showTicker}>
      <LiveRateTicker />
      <SiteHeader accountName={member?.fullName ?? null} />
      <main className="flex-1">{children}</main>
      <SiteFooter />
    </MarketRatesProvider>
  );
}
