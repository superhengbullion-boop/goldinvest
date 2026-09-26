import type { Metadata } from "next";
import { TermsDocument } from "@/components/TermsDocument";
import { getTerms } from "@/lib/data";
import { pageMetadata } from "@/lib/seo";

export async function generateMetadata(): Promise<Metadata> {
  return pageMetadata(await getTerms());
}

export default async function TermsPage() {
  const { content } = await getTerms();
  return <TermsDocument content={content} />;
}
