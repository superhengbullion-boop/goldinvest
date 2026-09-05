import { notFound } from "next/navigation";
import { PageEditor } from "@/components/admin/PageEditor";
import { isPageSlug, PAGE_FIELDS, PAGE_META } from "@/lib/cms";
import { prisma } from "@/lib/prisma";

export default async function EditPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  if (!isPageSlug(slug)) notFound();

  const page = await prisma.page.findUnique({ where: { slug } });
  if (!page) notFound();

  return (
    <div>
      <h1 className="font-display text-4xl text-gold">Edit {PAGE_META[slug].cmsLabel}</h1>
      <p className="mt-2 mb-8 text-mist">
        Changes appear on the public site after you save.
      </p>
      <PageEditor
        slug={slug}
        title={page.title}
        description={page.description ?? ""}
        content={page.content as Record<string, unknown>}
        fields={PAGE_FIELDS[slug]}
      />
    </div>
  );
}
