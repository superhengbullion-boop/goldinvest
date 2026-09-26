import { SiteSettingsForm } from "@/components/admin/SiteSettingsForm";
import { getSiteSettings } from "@/lib/data";

export default async function SiteSettingsPage() {
  const settings = await getSiteSettings();

  return (
    <div>
      <h1 className="font-display text-4xl text-gold">Site settings</h1>
      <p className="mt-2 mb-8 text-mist">
        Update the website logo and the default SEO title, description, and keywords.
      </p>
      <SiteSettingsForm settings={settings} />
    </div>
  );
}
