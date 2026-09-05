"use client";

import { useActionState, useTransition } from "react";
import Script from "next/script";
import { submitContact, type ContactFormState } from "@/app/actions/contact";
import { executeRecaptcha, RECAPTCHA_SITE_KEY } from "@/lib/recaptcha-client";

export function ContactForm() {
  const [state, formAction, pending] = useActionState<ContactFormState, FormData>(
    submitContact,
    undefined,
  );
  const [isVerifying, startTransition] = useTransition();
  const busy = pending || isVerifying;

  return (
    <form
      action={formAction}
      onSubmit={(event) => {
        event.preventDefault();
        const form = event.currentTarget;
        const data = new FormData(form);
        startTransition(async () => {
          const token = await executeRecaptcha("contact");
          if (token) data.set("recaptchaToken", token);
          startTransition(() => {
            formAction(data);
          });
        });
      }}
    >
      {RECAPTCHA_SITE_KEY ? (
        <Script
          src={`https://www.google.com/recaptcha/api.js?render=${RECAPTCHA_SITE_KEY}`}
          strategy="afterInteractive"
        />
      ) : null}
      <div className="flex gap-8 max-md:flex-col">
        <div className="w-[45%] max-md:w-full">
          <label className="mb-[5%] block text-[1rem]" htmlFor="name">
            Name
          </label>
          <input
            id="name"
            name="name"
            required
            placeholder="Enter your name"
            className="field-line mb-[8%]"
          />
          <label className="mb-[3%] block text-[1rem]" htmlFor="email">
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            placeholder="Enter your email"
            className="field-line"
          />
        </div>
        <div className="flex-1">
          <label className="mb-[3%] block text-[1rem]" htmlFor="phone">
            Phone
          </label>
          <input
            id="phone"
            name="phone"
            type="tel"
            required
            placeholder="Enter your phone number"
            className="field-line"
          />
        </div>
      </div>
      <div className="mt-[8%] flex flex-col">
        <label className="mb-[3%] text-[1rem]" htmlFor="message">
          How can we help you?
        </label>
        <textarea
          id="message"
          name="message"
          required
          rows={3}
          placeholder="Describe your query"
          className="rounded-lg border border-[#B0B0B0] bg-transparent p-3 text-[1rem] placeholder:text-[0.8rem] focus:border-gold focus:outline-none"
        />
      </div>
      {state?.message ? (
        <p className={`mt-4 text-sm ${state.ok ? "text-gold" : "text-red-400"}`}>
          {state.message}
        </p>
      ) : null}
      <div className="mt-[5%] flex justify-end max-md:justify-center">
        <button type="submit" disabled={busy} className="gold-btn px-10">
          {busy ? "Sending…" : "Submit"}
        </button>
      </div>
      {RECAPTCHA_SITE_KEY ? (
        <p className="mt-4 text-right text-[0.7rem] text-mist max-md:text-center">
          This site is protected by reCAPTCHA and the Google{" "}
          <a
            className="text-gold hover:underline"
            href="https://policies.google.com/privacy"
            target="_blank"
            rel="noreferrer"
          >
            Privacy Policy
          </a>{" "}
          and{" "}
          <a
            className="text-gold hover:underline"
            href="https://policies.google.com/terms"
            target="_blank"
            rel="noreferrer"
          >
            Terms of Service
          </a>{" "}
          apply.
        </p>
      ) : null}
    </form>
  );
}
