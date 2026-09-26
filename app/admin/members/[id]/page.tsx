import Link from "next/link";
import { notFound } from "next/navigation";
import { updateMember } from "@/app/actions/admin";
import { SaveFeedbackForm, SaveFeedbackSubmit } from "@/components/admin/SaveFeedbackForm";
import { getMemberById, getRateBooks } from "@/lib/data";

export default async function AdminMemberEditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const memberId = Number(id);
  if (!Number.isInteger(memberId) || memberId < 1) notFound();

  const [member, books] = await Promise.all([getMemberById(memberId), getRateBooks()]);
  if (!member) notFound();

  return (
    <div>
      <Link href="/admin/members" className="text-sm text-mist hover:text-gold">
        ← Back to members
      </Link>
      <h1 className="mt-4 font-display text-4xl text-gold">{member.memberId}</h1>
      <p className="mt-2 mb-8 text-mist">Member ID cannot be changed.</p>

      <SaveFeedbackForm
        action={updateMember}
        className="grid max-w-xl grid-cols-1 gap-4 rounded-xl border border-gold/25 p-6"
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
        <label className="text-sm">
          <span className="mb-1 block text-mist">New password</span>
          <input
            name="password"
            type="password"
            placeholder="Leave blank to keep current password"
            className="w-full rounded border border-gold/30 bg-ink px-3 py-2"
          />
        </label>
        <label className="text-sm">
          <span className="mb-1 block text-mist">Price book</span>
          <select
            name="rateBookId"
            defaultValue={member.rateBookId ?? ""}
            className="w-full rounded border border-gold/30 bg-ink px-3 py-2"
          >
            <option value="">No price book</option>
            {books.map((book) => (
              <option key={book.id} value={book.id}>
                {book.name}
                {book.isActive ? "" : " (disabled)"}
              </option>
            ))}
          </select>
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input name="isActive" type="checkbox" defaultChecked={member.isActive} />
          Active
        </label>
        <SaveFeedbackSubmit label="Save changes" className="gold-btn justify-self-start" />
      </SaveFeedbackForm>
    </div>
  );
}
