import { AppContentForm } from "@/components/admin/AppContentForm";
import { getAppContent } from "@/lib/app-content";

export default async function AppContentPage() {
  const content = await getAppContent();

  return (
    <div>
      <h1 className="font-display text-4xl text-gold">App content</h1>
      <p className="mt-2 mb-8 text-mist">
        Logo and labels for the Gold Invest app. Contact details stay on the Contact page.
      </p>
      <AppContentForm content={content} />
    </div>
  );
}
