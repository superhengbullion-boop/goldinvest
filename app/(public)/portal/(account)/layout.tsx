import Link from "next/link";
import { PortalTabs } from "@/components/PortalTabs";

export default function PortalAccountLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="mx-[5%] py-12 max-md:py-8">
      <p className="text-xs uppercase tracking-[0.3em] text-gold">Member portal</p>
      <h1 className="mt-3 font-display text-4xl text-gold max-md:text-3xl">My account</h1>
      <p className="mt-4 flex flex-wrap gap-4 text-sm">
        <Link href="/rates" className="text-gold hover:underline">
          View rates
        </Link>
        <Link href="/portal/cart" className="text-gold hover:underline">
          Cart
        </Link>
      </p>
      <PortalTabs />
      <div className="mt-8">{children}</div>
    </div>
  );
}
