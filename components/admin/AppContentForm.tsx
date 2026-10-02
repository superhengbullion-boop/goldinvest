"use client";

import { useState } from "react";
import { updateAppContent } from "@/app/actions/admin";
import { ImageField } from "@/components/admin/ImageField";
import { SaveFeedbackForm, SaveFeedbackSubmit } from "@/components/admin/SaveFeedbackForm";
import type { AppContent } from "@/lib/app-content";

const FIELDS: { name: keyof AppContent; label: string }[] = [
  { name: "ratesTitle", label: "Rates heading" },
  { name: "infoLabel", label: "Info button" },
  { name: "buyLabel", label: "Buy price heading" },
  { name: "sellLabel", label: "Sell price heading" },
  { name: "lockBuyLabel", label: "Lock buy button" },
  { name: "lockSellLabel", label: "Lock sell button" },
  { name: "comingSoonLabel", label: "Coming soon" },
];

export function AppContentForm({ content }: { content: AppContent }) {
  const [logo, setLogo] = useState(content.logo);
  const [values, setValues] = useState(content);
  const statusKey = `${logo}|${FIELDS.map((field) => values[field.name]).join("|")}`;

  return (
    <SaveFeedbackForm
      action={updateAppContent}
      className="space-y-8"
      successMessage="App content saved."
      statusKey={statusKey}
    >
      <input type="hidden" name="logo" value={logo} />
      <ImageField compact label="App logo" value={logo} onChange={setLogo} />
      <p className="-mt-4 text-xs text-mist">
        Leave this empty to use the website logo. The splash shows a new logo on the next cold start.
      </p>
      <div className="grid gap-6 md:grid-cols-2">
        {FIELDS.map((field) => (
          <label key={field.name} className="block">
            <span className="mb-2 block text-sm text-mist">{field.label}</span>
            <input
              name={field.name}
              value={values[field.name]}
              maxLength={48}
              onChange={(event) => setValues((current) => ({ ...current, [field.name]: event.target.value }))}
              className="w-full rounded-lg border border-gold/30 bg-ink px-4 py-3 outline-none focus:border-gold"
            />
          </label>
        ))}
      </div>
      <SaveFeedbackSubmit label="Save app content" />
    </SaveFeedbackForm>
  );
}
