import type { Metadata } from "next";
import { TermsDocument } from "@/components/TermsDocument";
import { getTerms } from "@/lib/data";

export async function generateMetadata(): Promise<Metadata> {
  const page = await getTerms();
  return { title: page.title, description: page.description ?? undefined };
}

export default async function TermsPage() {
  const { content } = await getTerms();
  return <TermsDocument content={content} />;
}
