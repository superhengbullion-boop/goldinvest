import Link from "next/link";
import { notFound } from "next/navigation";
import { updateMember } from "@/app/actions/admin";
import { MemberEditForm } from "@/components/admin/MembersForms";
import {
  getManualFxRates,
  getMemberById,
  getMetalQuotes,
  getRateBooks,
} from "@/lib/data";
import { toPricingBooks } from "@/lib/member-pricing";
import {
  buildRatesBoard,
  marketBoardForMetal,
  OFFSETTABLE_ROWS,
} from "@/lib/metal-quotes";

export default async function AdminMemberEditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const memberId = Number(id);
  if (!Number.isInteger(memberId) || memberId < 1) notFound();

  const [member, books, quotes, manualIdrMyr] = await Promise.all([
    getMemberById(memberId),
    getRateBooks(),
    getMetalQuotes(),
    getManualFxRates(),
  ]);
  if (!member) notFound();

  const goldMarket = marketBoardForMetal(quotes, "XAU");
  const silverMarket = marketBoardForMetal(quotes, "XAG");
  const marketBoard = buildRatesBoard(goldMarket, silverMarket, manualIdrMyr);
  const byKey = new Map(
    (member.adjustments ?? []).map((item) => [`${item.metal}:${item.unitKey}`, item]),
  );
  const initialOverrides = OFFSETTABLE_ROWS.map((row) => {
    const match = byKey.get(`${row.metal}:${row.unitKey}`);
    return {
      metal: row.metal,
      unitKey: row.unitKey,
      buyDelta: match?.buyDelta == null ? "" : String(Number(match.buyDelta)),
      sellDelta: match?.sellDelta == null ? "" : String(Number(match.sellDelta)),
    };
  });

  return (
    <div>
      <Link href="/admin/members" className="text-sm text-mist hover:text-gold">
        ← Back to members
      </Link>
      <h1 className="mt-4 font-display text-4xl text-gold">{member.memberId}</h1>
      <p className="mt-2 mb-8 text-mist">Member ID cannot be changed.</p>

      <MemberEditForm
        member={member}
        books={toPricingBooks(books)}
        marketBoard={marketBoard}
        goldMarket={goldMarket}
        silverMarket={silverMarket}
        manualIdrMyr={manualIdrMyr}
        initialOverrides={initialOverrides}
        action={updateMember}
      />
    </div>
  );
}
