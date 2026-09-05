import type { Metadata } from "next";
import { getAbout } from "@/lib/data";

export async function generateMetadata(): Promise<Metadata> {
  const page = await getAbout();
  return { title: page.title, description: page.description ?? undefined };
}

export default async function AboutPage() {
  const { content } = await getAbout();

  return (
    <div className="mt-[2rem]">
      <div
        className="relative mx-[10%] flex aspect-[17/8] flex-col justify-center overflow-hidden rounded-[25px] bg-cover bg-center p-[5%] max-md:mx-[5%] max-md:aspect-[3/2] max-md:rounded"
        style={
          content.heroBackground
            ? { backgroundImage: `url("${content.heroBackground}")` }
            : undefined
        }
      >
        {content.heroBackground ? (
          <div className="absolute inset-0 bg-black/25" />
        ) : (
          <>
            <div className="gold-shimmer absolute inset-0" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_78%_48%,rgba(237,190,1,0.32),transparent_52%)]" />
            <div className="absolute inset-0 bg-black/25" />
          </>
        )}
        <p className="relative text-[1.6rem] uppercase text-gold max-md:mb-[0.2rem] max-md:text-[0.9rem]">
          {content.title}
        </p>
        <p className="relative mt-2 w-[38%] text-justify text-[1.3rem] leading-8 max-md:w-[70%] max-md:text-[0.7rem] max-md:leading-5 lg:w-[42%]">
          {content.intro}
        </p>
      </div>

      <div className="mx-[10%] mt-[5%] text-justify text-[1rem] max-md:mx-[5%]">
        <p className="text-[2rem] leading-[3rem] text-gold">{content.unityTitle}</p>
        <p className="mt-2 text-justify text-[1rem] leading-7">{content.unityBody}</p>
      </div>

      <div className="mx-[10%] mt-[5%] flex gap-4 max-md:mx-[5%] max-md:flex-col">
        <div className="hidden overflow-hidden rounded max-md:block max-md:aspect-[3/2] max-md:w-full">
          <AboutPanel src={content.panelImage} />
        </div>
        <div className="flex-1 pr-[3rem] max-md:pr-0">
          <div>
            <p className="text-[2rem] leading-[3rem] text-gold">{content.accessTitle}</p>
            <p className="mt-[4%] text-justify text-[1rem] leading-7">{content.accessBody}</p>
          </div>
          <div className="mt-[10%] text-justify">
            <p className="text-[2rem] leading-[3rem] text-gold">{content.beyondTitle}</p>
            <p className="mt-[4%] text-[1rem] leading-7">{content.beyondBody1}</p>
            <p className="mt-8 text-[1rem] leading-7">{content.beyondBody2}</p>
            <p className="mt-8 text-[1rem] leading-7">{content.beyondBody3}</p>
          </div>
        </div>
        <div className="w-[40%] overflow-hidden rounded max-md:hidden">
          <AboutPanel src={content.panelImage} />
        </div>
      </div>
    </div>
  );
}

function AboutPanel({ src }: { src?: string }) {
  return (
    <div className="relative h-full min-h-[280px] w-full">
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={src} alt="" className="absolute inset-0 h-full w-full object-cover" />
      ) : (
        <div className="pattern-gold absolute inset-0" />
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
      <div className="absolute inset-x-6 bottom-6">
        <p className="font-display text-2xl text-gold">Integrity · Capability · Trust</p>
        <p className="mt-2 text-sm text-ivory/80">Turning ambition into gold.</p>
      </div>
    </div>
  );
}
