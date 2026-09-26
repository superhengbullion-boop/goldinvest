"use client";

import Link from "next/link";
import { createMember, deleteMember } from "@/app/actions/admin";
import { SaveFeedbackForm, SaveFeedbackSubmit } from "@/components/admin/SaveFeedbackForm";

type BookOption = { id: string; name: string };

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

export function MembersCreateForm({ books }: { books: BookOption[] }) {
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
      <select name="rateBookId" className="rounded border border-gold/30 bg-ink px-3 py-2">
        <option value="">No price book yet</option>
        {books.map((book) => (
          <option key={book.id} value={book.id}>
            {book.name}
          </option>
        ))}
      </select>
      <div className="col-span-full">
        <SaveFeedbackSubmit label="Create member" className="gold-btn justify-self-start" />
      </div>
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
