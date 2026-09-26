"use client";

import { useState } from "react";
import { updateSiteSettings } from "@/app/actions/admin";
import { ImageField } from "@/components/admin/ImageField";
import { SaveFeedbackForm, SaveFeedbackSubmit } from "@/components/admin/SaveFeedbackForm";
import type { SiteSettings } from "@/lib/seo";

export function SiteSettingsForm({ settings }: { settings: SiteSettings }) {
  const [siteName, setSiteName] = useState(settings.siteName);
  const [logo, setLogo] = useState(settings.logo);
  const [title, setTitle] = useState(settings.title);
  const [description, setDescription] = useState(settings.description);
  const [keywords, setKeywords] = useState(settings.keywords);
  const statusKey = `${siteName}|${logo}|${title}|${description}|${keywords}`;

  return (
    <SaveFeedbackForm
      action={updateSiteSettings}
      className="space-y-8"
      successMessage="Site settings saved successfully."
      statusKey={statusKey}
    >
      <input type="hidden" name="logo" value={logo} />

      <ImageField
        compact
        label="Website logo"
        value={logo}
        onChange={(url) => setLogo(url)}
      />

      <label className="block">
        <span className="mb-2 block text-sm text-mist">Site name</span>
        <input
          name="siteName"
          value={siteName}
          onChange={(e) => setSiteName(e.target.value)}
          className="w-full rounded-lg border border-gold/30 bg-ink px-4 py-3 outline-none focus:border-gold"
        />
        <p className="mt-2 text-xs text-mist">Shown beside the logo and in the browser title.</p>
      </label>

      <fieldset className="space-y-6 rounded-xl border border-gold/20 p-5">
        <legend className="px-2 text-gold">Default SEO</legend>
        <label className="block">
          <span className="mb-2 block text-sm text-mist">SEO title</span>
          <input
            name="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full rounded-lg border border-gold/30 bg-ink px-4 py-3 outline-none focus:border-gold"
          />
        </label>
        <label className="block">
          <span className="mb-2 block text-sm text-mist">SEO description</span>
          <textarea
            name="description"
            value={description}
            rows={4}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full rounded-lg border border-gold/30 bg-ink px-4 py-3 outline-none focus:border-gold"
          />
          <p className="mt-2 text-xs text-mist">
            Default description for search results. Each page can override this.
          </p>
        </label>
        <label className="block">
          <span className="mb-2 block text-sm text-mist">SEO keywords</span>
          <textarea
            name="keywords"
            value={keywords}
            rows={3}
            onChange={(e) => setKeywords(e.target.value)}
            placeholder="buy gold Malaysia, gold price, bullion"
            className="w-full rounded-lg border border-gold/30 bg-ink px-4 py-3 outline-none focus:border-gold"
          />
          <p className="mt-2 text-xs text-mist">
            Comma-separated search queries. Pages with their own keywords use those instead.
          </p>
        </label>
      </fieldset>

      <div className="flex items-center gap-4">
        <SaveFeedbackSubmit label="Save settings" className="gold-btn" />
      </div>
    </SaveFeedbackForm>
  );
}
