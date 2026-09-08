import type { Metadata } from "next";
import { MetalRateTable } from "@/components/MetalRateTable";
import { RichText } from "@/components/RichText";
import { getMetalQuotes, getRatesPage } from "@/lib/data";
import { getMember } from "@/lib/member-session";
import { applyAdjustments, metalBoard } from "@/lib/metal-quotes";

export async function generateMetadata(): Promise<Metadata> {
  const page = await getRatesPage();
  return { title: page.title, description: page.description ?? undefined };
}

export default async function RatesPage() {
  const [{ content }, quotes, member] = await Promise.all([
    getRatesPage(),
    getMetalQuotes(),
    getMember(),
  ]);
  const adjustments = member?.rateBook?.isActive ? member.rateBook.adjustments : [];
  const goldRows = applyAdjustments(
    metalBoard(
      quotes.find((quote) => quote.metal === "XAU" && quote.currency === "USD"),
      quotes.find((quote) => quote.metal === "XAU" && quote.currency === "MYR"),
    ),
    "XAU",
    adjustments,
  );
  const silverRows = applyAdjustments(
    metalBoard(
      quotes.find((quote) => quote.metal === "XAG" && quote.currency === "USD"),
      quotes.find((quote) => quote.metal === "XAG" && quote.currency === "MYR"),
    ),
    "XAG",
    adjustments,
  );
  const goldUpdated =
    quotes.find((quote) => quote.metal === "XAU" && quote.currency === "MYR")?.fetchedAt ??
    quotes.find((quote) => quote.metal === "XAU")?.fetchedAt ??
    null;
  const silverUpdated =
    quotes.find((quote) => quote.metal === "XAG" && quote.currency === "MYR")?.fetchedAt ??
    quotes.find((quote) => quote.metal === "XAG")?.fetchedAt ??
    null;

  return (
    <div className="mx-[5%] py-8 max-md:mt-4">
      <div>
        <p className="text-[2rem] text-gold max-md:text-center max-md:text-[1.5rem]">
          {content.header}
        </p>
        <RichText
          html={content.headerText}
          className="text-[1rem] max-md:mt-4 max-md:text-center"
        />
      </div>

      {!member?.rateBook ? (
        <p className="mt-16 text-mist max-md:text-center">
          Your rate book is not assigned yet. Please contact us.
        </p>
      ) : goldRows.length === 0 && silverRows.length === 0 ? (
        <p className="mt-16 text-mist max-md:text-center">Rates will be published shortly.</p>
      ) : (
        <div className="mt-10 grid grid-cols-2 gap-10 max-md:grid-cols-1 max-md:gap-12">
          {goldRows.length > 0 ? (
            <MetalRateTable metal="Gold" rows={goldRows} updatedAt={goldUpdated} tone="gold" />
          ) : null}
          {silverRows.length > 0 ? (
            <MetalRateTable metal="Silver" rows={silverRows} updatedAt={silverUpdated} tone="silver" />
          ) : null}
        </div>
      )}
    </div>
  );
}
