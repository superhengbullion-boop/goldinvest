import { RichText } from "@/components/RichText";
import { resolveTermsBody } from "@/lib/terms-html";
import type { TermsContent } from "@/lib/types";

export function TermsDocument({ content }: { content: TermsContent }) {
  const body = resolveTermsBody(content);

  return (
    <div className="terms-doc mx-[10%] mt-[3%] pb-12 text-justify max-md:mx-[5%] max-md:mt-4 max-md:pb-8">
      <h1>{content.companyName}</h1>
      <h1 className="mb-10">{content.title}</h1>
      <RichText html={body} />
    </div>
  );
}
