"use client";

import { useEffect, useState, type ReactNode } from "react";
import { useFormStatus } from "react-dom";

export function SaveFeedbackSubmit({
  label,
  pendingLabel = "Saving…",
  className = "gold-btn py-2",
}: {
  label: string;
  pendingLabel?: string;
  className?: string;
}) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} className={className}>
      {pending ? pendingLabel : label}
    </button>
  );
}

export function SaveFeedbackForm({
  action,
  className,
  children,
  successMessage = "Saved successfully",
  statusKey,
  feedbackClassName = "col-span-full mt-3 text-sm",
}: {
  action: (formData: FormData) => Promise<void>;
  className?: string;
  children: ReactNode;
  successMessage?: string;
  /** When this changes, clear the previous success/error message. */
  statusKey?: string | number;
  feedbackClassName?: string;
}) {
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setSaved(false);
    setError(null);
  }, [statusKey]);

  return (
    <form
      className={className}
      onChange={() => {
        if (saved || error) {
          setSaved(false);
          setError(null);
        }
      }}
      action={async (formData) => {
        setSaved(false);
        setError(null);
        try {
          await action(formData);
          setSaved(true);
        } catch (err) {
          setError(err instanceof Error ? err.message : "Save failed.");
        }
      }}
    >
      {children}
      {saved && successMessage ? (
        <p className={`${feedbackClassName} text-gold`} role="status">
          {successMessage}
        </p>
      ) : null}
      {error ? (
        <p className={`${feedbackClassName} text-red-400`} role="alert">
          {error}
        </p>
      ) : null}
    </form>
  );
}
