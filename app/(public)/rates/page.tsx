import type { Metadata } from "next";
import { LiveRatesBoard } from "@/components/LiveRatesBoard";
import { RichText } from "@/components/RichText";
import { getRatesPage } from "@/lib/data";
import { getMember } from "@/lib/member-session";
export async function generateMetadata(): Promise<Metadata> {
  const page = await getRatesPage();
  return { title: page.title, description: page.description ?? undefined };
}

export default async function RatesPage() {
  const [{ content }, member] = await Promise.all([getRatesPage(), getMember()]);

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
      ) : (
        <LiveRatesBoard />
      )}
    </div>
  );
}
