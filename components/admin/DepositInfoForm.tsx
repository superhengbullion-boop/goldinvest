"use client";

import { useState } from "react";
import { updateDepositSettings } from "@/app/actions/deposits";
import { SaveFeedbackForm, SaveFeedbackSubmit } from "@/components/admin/SaveFeedbackForm";
import type { DepositSettings } from "@/lib/deposit-settings";

export function DepositInfoForm({ settings }: { settings: DepositSettings }) {
  const [values, setValues] = useState({
    ...settings,
    fundInstructions: settings.fundInstructions.join("\n"),
    xauInstructions: settings.xauInstructions.join("\n"),
  });

  return (
    <SaveFeedbackForm action={updateDepositSettings} className="space-y-6" successMessage="Deposit info saved.">
      <Field
        name="infoHeading"
        label="Information heading"
        value={values.infoHeading}
        onChange={(infoHeading) => setValues((current) => ({ ...current, infoHeading }))}
      />
      <Field
        name="supportPhone"
        label="Support phone"
        value={values.supportPhone}
        onChange={(supportPhone) => setValues((current) => ({ ...current, supportPhone }))}
      />
      <Field
        name="accountHolderName"
        label="Account holder name"
        value={values.accountHolderName}
        onChange={(accountHolderName) => setValues((current) => ({ ...current, accountHolderName }))}
      />
      <Field
        name="bankName"
        label="Bank name"
        value={values.bankName}
        onChange={(bankName) => setValues((current) => ({ ...current, bankName }))}
      />
      <Field
        name="bankAccount"
        label="Bank account"
        value={values.bankAccount}
        onChange={(bankAccount) => setValues((current) => ({ ...current, bankAccount }))}
      />
      <TextArea
        name="fundInstructions"
        label="Fund instructions"
        hint="One step per line. Shown on the Fund deposit tab."
        value={values.fundInstructions}
        onChange={(fundInstructions) => setValues((current) => ({ ...current, fundInstructions }))}
      />
      <TextArea
        name="xauInstructions"
        label="XAU instructions"
        hint="One step per line. Shown on the XAU deposit tab."
        value={values.xauInstructions}
        onChange={(xauInstructions) => setValues((current) => ({ ...current, xauInstructions }))}
      />
      <SaveFeedbackSubmit label="Save deposit info" />
    </SaveFeedbackForm>
  );
}

function Field({
  name,
  label,
  value,
  onChange,
}: {
  name: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm text-mist">{label}</span>
      <input
        name={name}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="w-full rounded-lg border border-gold/30 bg-ink px-4 py-3 outline-none focus:border-gold"
      />
    </label>
  );
}

function TextArea({
  name,
  label,
  hint,
  value,
  onChange,
}: {
  name: string;
  label: string;
  hint: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm text-mist">{label}</span>
      <textarea
        name={name}
        value={value}
        rows={5}
        onChange={(event) => onChange(event.target.value)}
        className="w-full rounded-lg border border-gold/30 bg-ink px-4 py-3 outline-none focus:border-gold"
      />
      <span className="mt-2 block text-xs text-mist">{hint}</span>
    </label>
  );
}
