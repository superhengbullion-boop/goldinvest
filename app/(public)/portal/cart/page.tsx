import Link from "next/link";
import { CartPanel } from "@/components/CartPanel";
import { getCartItems } from "@/lib/orders";
import { getMember } from "@/lib/member-session";

export default async function CartPage({
  searchParams,
}: {
  searchParams: Promise<{ placed?: string }>;
}) {
  const member = await getMember();
  if (!member) return null;

  const [{ placed }, cart] = await Promise.all([
    searchParams,
    getCartItems(member.id),
  ]);

  const items = cart.map((item) => ({
    id: item.id,
    metal: item.metal,
    lockedSellPrice: Number(item.lockedSellPrice),
    qtyKg: Number(item.qtyKg),
  }));

  return (
    <div className="mx-[5%] py-12 max-md:py-8">
      <p className="text-xs uppercase tracking-[0.3em] text-gold">Member portal</p>
      <h1 className="mt-3 font-display text-4xl text-gold max-md:text-3xl">Cart</h1>
      <p className="mt-4 text-sm text-mist">
        Prices are locked at the board sell rate when you add MYR/KG.{" "}
        <Link href="/rates" className="text-gold hover:underline">
          Back to rates
        </Link>
      </p>
      <CartPanel items={items} placedOrderNo={placed ?? null} />
    </div>
  );
}
