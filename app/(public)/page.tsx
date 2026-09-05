import type { Metadata } from "next";
import { ContactForm } from "@/components/ContactForm";
import { GoldButton } from "@/components/GoldButton";
import { ProductIcon } from "@/components/ProductIcon";
import { TrustedPartners } from "@/components/TrustedPartners";
import { getContact, getHome } from "@/lib/data";

export async function generateMetadata(): Promise<Metadata> {
  const page = await getHome();
  return {
    title: page.title,
    description: page.description ?? undefined,
  };
}

export default async function HomePage() {
  const [{ content }, contact] = await Promise.all([getHome(), getContact()]);

  return (
    <div>
      <div className="relative">
        <div className="relative mx-[10%] overflow-hidden rounded-[25px] max-md:mx-0 max-md:h-[42vh] max-md:rounded-none">
          <HeroBackdrop src={content.heroBackground} />
          <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/35 to-transparent" />
          <div className="relative flex h-full items-center p-[3%] min-h-[420px] max-md:min-h-[42vh]">
            <div className="w-[48%] max-md:w-[85%]">
              <h1 className="font-display text-5xl font-semibold leading-tight text-gold max-md:text-3xl">
                {content.heroTitle}
              </h1>
              <p className="mt-4 text-[1.15rem] leading-8 text-ivory/90 max-md:text-[0.85rem] max-md:leading-6">
                {content.heroSubtitle}
              </p>
              <div className="mt-[5%] flex gap-4">
                <GoldButton href="/contact">{content.heroCta}</GoldButton>
              </div>
            </div>
          </div>
        </div>
      </div>

      <TrustedPartners title={content.partnersTitle} partners={content.partners} />

      <section className="mx-[10%] mt-10 flex gap-8 max-md:mx-[5%] max-md:flex-col max-md:gap-4">
        {[
          {
            title: content.missionTitle,
            text: content.missionText,
            image: content.missionImage,
          },
          {
            title: content.visionTitle,
            text: content.visionText,
            image: content.visionImage,
          },
          {
            title: content.coreValueTitle,
            text: content.coreValueText,
            image: content.coreValueImage,
          },
        ].map((card) => (
          <div
            key={card.title}
            className="relative flex min-h-[200px] flex-1 flex-col justify-center overflow-hidden rounded-lg bg-black p-8 max-md:min-h-[180px] max-md:p-8"
            style={
              card.image
                ? {
                    backgroundImage: `url("${card.image}")`,
                    backgroundSize: "cover",
                    backgroundPosition: "center right",
                  }
                : undefined
            }
          >
            <div className="absolute inset-0 bg-gradient-to-r from-black from-35% via-black/80 to-black/20" />
            <p className="relative z-[1] text-[1.6rem] text-gold">{card.title}</p>
            <p className="relative z-[1] mt-2 max-w-[62%] text-[1rem] font-normal text-ivory/90 max-md:max-w-none">
              {card.text}
            </p>
          </div>
        ))}
      </section>

      <section className="pt-[5%]">
        <p className="text-center text-[1.6rem]">{content.productsTitle}</p>
        <div className="mx-[10%] mt-[3%] grid grid-cols-4 gap-8 max-lg:grid-cols-2 max-md:mx-[5%] max-md:grid-cols-1">
          {content.products.map((product) => (
            <article
              key={product.title}
              className="flex min-h-[220px] flex-col justify-between rounded-xl bg-black p-6"
            >
              <ProductIcon name={product.icon} />
              <p className="mt-8 text-[1rem] leading-6 text-ivory">{product.title}</p>
            </article>
          ))}
        </div>
      </section>

      <section id="contact" className="relative mx-[10%] mt-[5%] max-md:mx-[5%]">
        <h2 className="font-display text-[2rem] text-gold max-md:text-center">
          {contact.content.title}
        </h2>
        <div className="mt-[3%] flex gap-8 rounded-xl bg-black p-[5%] max-md:flex-col max-md:bg-transparent">
          <div className="flex-1">
            <p className="text-[1rem] max-md:text-center">{contact.content.intro}</p>
            <h3 className="py-[5%] font-display text-[1.4rem] text-gold">
              {contact.content.companyName}
            </h3>
            <p className="text-[1.2rem]">Contact Us</p>
            <div className="w-[90%] py-[3%] text-[1rem] font-normal">
              <p>Tel: {contact.content.tel}</p>
              <p>
                Email:{" "}
                <a className="text-gold" href={`mailto:${contact.content.email}`}>
                  {contact.content.email}
                </a>
              </p>
              <p className="mt-2 whitespace-pre-line">Address: {contact.content.address}</p>
            </div>
            <p className="text-[1rem] font-normal">{contact.content.hours}</p>
          </div>
          <div className="flex-1 pt-[4%]">
            <ContactForm />
          </div>
        </div>
      </section>
    </div>
  );
}

function HeroBackdrop({ src }: { src?: string }) {
  if (src?.toLowerCase().endsWith(".mp4")) {
    return (
      <video
        className="absolute inset-0 h-full w-full object-cover"
        src={src}
        autoPlay
        muted
        loop
        playsInline
      />
    );
  }

  if (src) {
    return (
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url("${src}")` }}
      />
    );
  }

  return (
    <>
      <div className="gold-shimmer absolute inset-0" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_50%,rgba(237,190,1,0.28),transparent_55%)]" />
    </>
  );
}
