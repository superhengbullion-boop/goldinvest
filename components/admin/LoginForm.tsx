"use client";

import { useActionState } from "react";
import { login } from "@/app/actions/auth";
import type { AuthFormState } from "@/lib/types";

export function LoginForm() {
  const [state, action, pending] = useActionState<AuthFormState, FormData>(
    login,
    undefined,
  );

  return (
    <form action={action} className="space-y-6">
      <div>
        <label htmlFor="email" className="mb-2 block text-sm text-mist">
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          className="w-full rounded-lg border border-gold/30 bg-ink px-4 py-3 text-ivory outline-none focus:border-gold"
        />
      </div>
      <div>
        <label htmlFor="password" className="mb-2 block text-sm text-mist">
          Password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          className="w-full rounded-lg border border-gold/30 bg-ink px-4 py-3 text-ivory outline-none focus:border-gold"
        />
      </div>
      {state?.error ? <p className="text-sm text-red-400">{state.error}</p> : null}
      <button type="submit" disabled={pending} className="gold-btn w-full">
        {pending ? "Signing in…" : "Sign in"}
      </button>
    </form>
  );
}
