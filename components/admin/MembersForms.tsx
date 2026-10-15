"use client";

import Link from "next/link";
import { createMember, deleteMember } from "@/app/actions/admin";
import {
  MemberPricingFields,
  type PricingOverrideValue,
} from "@/components/admin/MemberPricingFields";
import { SaveFeedbackForm, SaveFeedbackSubmit } from "@/components/admin/SaveFeedbackForm";
import type { PricingBookOption } from "@/lib/member-pricing";
import type { BoardRow, ManualIdrMyr } from "@/lib/metal-quotes";

type MemberRow = {
  id: number;
  memberId: string;
  username: string;
  fullName: string;
  email: string;
  phone: string;
  isActive: boolean;
  rateBook: { name: string } | null;
};

export type MemberPricingProps = {
  books: PricingBookOption[];
  marketBoard: BoardRow[];
  goldMarket: BoardRow[];
  silverMarket: BoardRow[];
  manualIdrMyr: ManualIdrMyr;
};

export function MembersCreateForm({
  books,
  marketBoard,
  goldMarket,
  silverMarket,
  manualIdrMyr,
}: MemberPricingProps) {
  return (
    <SaveFeedbackForm
      action={createMember}
      className="mb-10 grid grid-cols-2 gap-4 rounded-xl border border-gold/25 p-6 max-md:grid-cols-1"
      successMessage="Member created successfully."
    >
      <h2 className="col-span-full font-display text-xl">Add member</h2>
      <input
        name="username"
        required
        placeholder="Username"
        className="rounded border border-gold/30 bg-ink px-3 py-2"
      />
      <input
        name="password"
        type="password"
        required
        placeholder="Password"
        className="rounded border border-gold/30 bg-ink px-3 py-2"
      />
      <input
        name="fullName"
        required
        placeholder="Full name"
        className="rounded border border-gold/30 bg-ink px-3 py-2"
      />
      <input
        name="phone"
        required
        placeholder="Phone"
        className="rounded border border-gold/30 bg-ink px-3 py-2"
      />
      <input
        name="email"
        type="email"
        required
        placeholder="Email"
        className="rounded border border-gold/30 bg-ink px-3 py-2"
      />
      <MemberPricingFields
        books={books}
        marketBoard={marketBoard}
        goldMarket={goldMarket}
        silverMarket={silverMarket}
        manualIdrMyr={manualIdrMyr}
      />
      <div className="col-span-full">
        <SaveFeedbackSubmit label="Create member" className="gold-btn justify-self-start" />
      </div>
    </SaveFeedbackForm>
  );
}

export function MemberEditForm({
  member,
  books,
  marketBoard,
  goldMarket,
  silverMarket,
  manualIdrMyr,
  initialOverrides,
  showTradingLimit = false,
  action,
}: MemberPricingProps & {
  member: {
    id: number;
    username: string;
    fullName: string;
    phone: string;
    email: string;
    rateBookId: string | null;
    isActive: boolean;
    tradingLimitMyr?: unknown;
  };
  showTradingLimit?: boolean;
  initialOverrides: PricingOverrideValue[];
  action: (formData: FormData) => Promise<void>;
}) {
  return (
    <SaveFeedbackForm
      action={action}
      className="grid max-w-4xl grid-cols-1 gap-4 rounded-xl border border-gold/25 p-6"
      successMessage="Member saved successfully."
    >
      <input type="hidden" name="id" value={member.id} />
      <label className="text-sm">
        <span className="mb-1 block text-mist">Username</span>
        <input
          name="username"
          defaultValue={member.username}
          required
          className="w-full rounded border border-gold/30 bg-ink px-3 py-2"
        />
      </label>
      <label className="text-sm">
        <span className="mb-1 block text-mist">Full name</span>
        <input
          name="fullName"
          defaultValue={member.fullName}
          required
          className="w-full rounded border border-gold/30 bg-ink px-3 py-2"
        />
      </label>
      <label className="text-sm">
        <span className="mb-1 block text-mist">Phone</span>
        <input
          name="phone"
          defaultValue={member.phone}
          required
          className="w-full rounded border border-gold/30 bg-ink px-3 py-2"
        />
      </label>
      <label className="text-sm">
        <span className="mb-1 block text-mist">Email</span>
        <input
          name="email"
          type="email"
          defaultValue={member.email}
          required
          className="w-full rounded border border-gold/30 bg-ink px-3 py-2"
        />
      </label>
      {showTradingLimit ? (
        <label className="text-sm">
          <span className="mb-1 block text-mist">Trading limit (RM)</span>
          <input
            name="tradingLimitMyr"
            inputMode="decimal"
            defaultValue={Number(member.tradingLimitMyr ?? 0)}
            className="w-full rounded border border-gold/30 bg-ink px-3 py-2"
          />
        </label>
      ) : null}
      <label className="text-sm">
        <span className="mb-1 block text-mist">New password</span>
        <input
          name="password"
          type="password"
          placeholder="Leave blank to keep current password"
          className="w-full rounded border border-gold/30 bg-ink px-3 py-2"
        />
      </label>
      <MemberPricingFields
        books={books}
        marketBoard={marketBoard}
        goldMarket={goldMarket}
        silverMarket={silverMarket}
        manualIdrMyr={manualIdrMyr}
        initialBookId={member.rateBookId ?? ""}
        initialOverrides={initialOverrides}
        allowInactiveBooks
      />
      <label className="flex items-center gap-2 text-sm">
        <input name="isActive" type="checkbox" defaultChecked={member.isActive} />
        Active
      </label>
      <SaveFeedbackSubmit label="Save changes" className="gold-btn justify-self-start" />
    </SaveFeedbackForm>
  );
}

export function MemberDeleteForm({ memberId }: { memberId: number }) {
  return (
    <SaveFeedbackForm
      action={deleteMember}
      successMessage=""
      feedbackClassName="mt-1 text-xs"
    >
      <input type="hidden" name="id" value={memberId} />
      <SaveFeedbackSubmit
        label="Delete"
        pendingLabel="Deleting…"
        className="text-red-400 hover:underline disabled:opacity-60"
      />
    </SaveFeedbackForm>
  );
}

export function MembersTable({ members }: { members: MemberRow[] }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[56rem] text-left text-sm">
        <thead className="bg-black text-xs uppercase tracking-[0.14em] text-gold">
          <tr>
            <th className="px-4 py-3">Member ID</th>
            <th className="px-4 py-3">Username</th>
            <th className="px-4 py-3">Full name</th>
            <th className="px-4 py-3">Email</th>
            <th className="px-4 py-3">Phone</th>
            <th className="px-4 py-3">Price book</th>
            <th className="px-4 py-3">Status</th>
            <th className="px-4 py-3 text-right">Actions</th>
          </tr>
        </thead>
        <tbody>
          {members.length === 0 ? (
            <tr>
              <td colSpan={8} className="px-4 py-8 text-center text-mist">
                No members match these filters.
              </td>
            </tr>
          ) : (
            members.map((member) => (
              <tr key={member.id} className="border-t border-gold/15">
                <td className="px-4 py-3 font-medium text-gold">{member.memberId}</td>
                <td className="px-4 py-3">{member.username}</td>
                <td className="px-4 py-3">{member.fullName}</td>
                <td className="px-4 py-3">{member.email}</td>
                <td className="px-4 py-3">{member.phone}</td>
                <td className="px-4 py-3 text-mist">{member.rateBook?.name ?? "—"}</td>
                <td className="px-4 py-3">{member.isActive ? "Active" : "Disabled"}</td>
                <td className="px-4 py-3">
                  <div className="flex justify-end gap-3">
                    <Link
                      href={`/admin/members/${member.id}`}
                      className="text-gold hover:underline"
                    >
                      Edit
                    </Link>
                    <MemberDeleteForm memberId={member.id} />
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
