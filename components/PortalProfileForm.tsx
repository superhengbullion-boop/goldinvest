"use client";

import { useActionState } from "react";
import { updateMemberProfile, type ProfileFormState } from "@/app/actions/member-auth";

type Member = {
  memberId: string;
  username: string;
  fullName: string;
  phone: string;
  email: string;
};

export function PortalProfileForm({ member }: { member: Member }) {
  const [state, action, pending] = useActionState<ProfileFormState, FormData>(
    updateMemberProfile,
    undefined,
  );

  return (
    <form action={action} className="mt-8 max-w-xl space-y-6">
      <label className="block">
        <span className="mb-2 block text-sm text-mist">Member ID</span>
        <input
          value={member.memberId}
          readOnly
          className="w-full rounded-lg border border-gold/20 bg-ink-2 px-4 py-3 text-mist"
        />
      </label>
      <label className="block">
        <span className="mb-2 block text-sm text-mist">Username</span>
        <input
          name="username"
          defaultValue={member.username}
          required
          className="w-full rounded-lg border border-gold/30 bg-ink px-4 py-3 outline-none focus:border-gold"
        />
      </label>
      <label className="block">
        <span className="mb-2 block text-sm text-mist">Full name</span>
        <input
          name="fullName"
          defaultValue={member.fullName}
          required
          className="w-full rounded-lg border border-gold/30 bg-ink px-4 py-3 outline-none focus:border-gold"
        />
      </label>
      <label className="block">
        <span className="mb-2 block text-sm text-mist">Phone</span>
        <input
          value={member.phone}
          readOnly
          className="w-full rounded-lg border border-gold/20 bg-ink-2 px-4 py-3 text-mist"
        />
      </label>
      <label className="block">
        <span className="mb-2 block text-sm text-mist">Email</span>
        <input
          value={member.email}
          readOnly
          className="w-full rounded-lg border border-gold/20 bg-ink-2 px-4 py-3 text-mist"
        />
      </label>
      <label className="block">
        <span className="mb-2 block text-sm text-mist">New password</span>
        <input
          name="password"
          type="password"
          autoComplete="new-password"
          placeholder="Leave blank to keep current password"
          className="w-full rounded-lg border border-gold/30 bg-ink px-4 py-3 outline-none focus:border-gold"
        />
      </label>
      <label className="block">
        <span className="mb-2 block text-sm text-mist">Confirm new password</span>
        <input
          name="confirmPassword"
          type="password"
          autoComplete="new-password"
          className="w-full rounded-lg border border-gold/30 bg-ink px-4 py-3 outline-none focus:border-gold"
        />
      </label>
      {state?.error ? <p className="text-sm text-red-400">{state.error}</p> : null}
      {state?.ok ? <p className="text-sm text-gold">{state.ok}</p> : null}
      <button type="submit" disabled={pending} className="gold-btn">
        {pending ? "Saving…" : "Save changes"}
      </button>
    </form>
  );
}
