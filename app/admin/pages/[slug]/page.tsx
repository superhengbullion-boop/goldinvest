import {notFound} from 'next/navigation';
import {PageEditor} from '@/components/admin/PageEditor';
import {isPageSlug, PAGE_FIELDS, PAGE_META} from '@/lib/cms';
import { getPageBySlug } from '@/lib/data';
import { normalizeContactForEditor } from '@/lib/contact-locations';
import { normalizeTermsForEditor } from '@/lib/terms-html';

export default async function EditPage({
	params,
}: {
	params: Promise<{slug: string}>;
}) {
	const {slug} = await params;
	if (!isPageSlug(slug)) notFound();

	const page = await getPageBySlug(slug);
	if (!page) notFound();

	return (
		<div>
			<h1 className='font-display text-4xl text-gold'>
				Edit {PAGE_META[slug].cmsLabel}
			</h1>
			<p className='mt-2 mb-8 text-mist'>
				Changes appear on the public site after you save.
			</p>
			<PageEditor
				slug={slug}
				title={page.title}
				description={page.description ?? ''}
				content={
					slug === 'terms'
						? normalizeTermsForEditor(page.content as Record<string, unknown>)
						: slug === 'contact'
							? normalizeContactForEditor(page.content as Record<string, unknown>)
							: (page.content as Record<string, unknown>)
				}
				fields={PAGE_FIELDS[slug]}
			/>
		</div>
	);
}
