import type { Metadata } from "next";
import { ContactForm } from "@/components/ContactForm";
import { ContactMapSection } from "@/components/ContactMapSection";
import { RichText } from "@/components/RichText";
import { resolveContactLocations } from "@/lib/contact-locations";
import { getContact } from "@/lib/data";

export async function generateMetadata(): Promise<Metadata> {
  const page = await getContact();
  return { title: page.title, description: page.description ?? undefined };
}

export default async function ContactPage() {
  const { content } = await getContact();
  const locations = resolveContactLocations(content);

  return (
    <div className="mx-[10%] py-12 max-md:mx-[5%] max-md:py-8">
      <h1 className="font-display text-[2rem] text-gold max-md:text-center max-md:text-xl">
        {content.title}
      </h1>
      <div className="mt-[3%] flex gap-8 rounded-xl bg-black p-[5%] max-md:flex-col max-md:p-6">
        <div className="flex-1 max-md:text-center">
          <RichText html={content.intro} className="text-[1rem]" />
          <h2 className="py-[5%] font-display text-[1.4rem] text-gold max-md:text-xl">
            {content.companyName}
          </h2>
          <p className="text-[1.2rem]">Contact Us</p>
          <div className="w-[90%] py-[3%] text-[1rem] font-normal max-md:mx-auto max-md:w-full">
            <p>Tel: {content.tel}</p>
            <p>
              Email:{" "}
              <a className="text-gold" href={`mailto:${content.email}`}>
                {content.email}
              </a>
            </p>
            <p className="mt-2 whitespace-pre-line">Address: {content.address}</p>
          </div>
          <p className="text-[1rem] font-normal">{content.hours}</p>
        </div>
        <div className="flex-1 max-md:pt-4">
          <ContactForm />
        </div>
      </div>
      <div className="mt-8">
        <h2 className="mb-4 font-display text-[1.4rem] text-gold max-md:text-xl">Find us</h2>
        <ContactMapSection locations={locations} />
      </div>
    </div>
  );
}
