import Link from "next/link";
import { MembersCreateForm, MembersTable } from "@/components/admin/MembersForms";
import { getMembersPage, getRateBooks } from "@/lib/data";

function first(value: string | string[] | undefined) {
  return Array.isArray(value) ? (value[0] ?? "") : (value ?? "");
}

function queryString(params: Record<string, string | number | undefined>) {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === "") continue;
    search.set(key, String(value));
  }
  const text = search.toString();
  return text ? `?${text}` : "";
}

export default async function AdminMembersPage({
  searchParams,
}: {
  searchParams: Promise<{
    username?: string;
    email?: string;
    phone?: string;
    page?: string;
  }>;
}) {
  const params = await searchParams;
  const username = first(params.username).trim();
  const email = first(params.email).trim();
  const phone = first(params.phone).trim();
  const requestedPage = Math.max(1, Number(params.page) || 1);

  const [{ members, total, page, pageCount }, books] = await Promise.all([
    getMembersPage({ username, email, phone, page: requestedPage }),
    getRateBooks(),
  ]);
  const bookOptions = books.filter((book) => book.isActive).map((book) => ({
    id: book.id,
    name: book.name,
  }));
  const filters = { username, email, phone };

  return (
    <div>
      <h1 className="mb-10 font-display text-4xl text-gold">Members</h1>

      <MembersCreateForm books={bookOptions} />

      <section className="rounded-xl border border-gold/25 p-6">
        <div className="mb-5 flex flex-wrap items-end justify-between gap-4">
          <h2 className="font-display text-xl">Member list</h2>
          <p className="text-sm text-mist">
            {total} member{total === 1 ? "" : "s"}
          </p>
        </div>

        <form
          method="get"
          className="mb-6 grid grid-cols-4 gap-3 max-lg:grid-cols-2 max-md:grid-cols-1"
        >
          <input
            name="username"
            defaultValue={username}
            placeholder="Username"
            className="rounded border border-gold/30 bg-ink px-3 py-2"
          />
          <input
            name="email"
            defaultValue={email}
            placeholder="Email"
            className="rounded border border-gold/30 bg-ink px-3 py-2"
          />
          <input
            name="phone"
            defaultValue={phone}
            placeholder="Phone"
            className="rounded border border-gold/30 bg-ink px-3 py-2"
          />
          <div className="flex gap-3">
            <button type="submit" className="gold-btn py-2">
              Search
            </button>
            <Link
              href="/admin/members"
              className="self-center text-sm text-mist hover:text-gold"
            >
              Clear
            </Link>
          </div>
        </form>

        <MembersTable members={members} />

        {pageCount > 1 ? (
          <div className="mt-6 flex flex-wrap items-center justify-between gap-3 text-sm">
            <p className="text-mist">
              Page {page} of {pageCount}
            </p>
            <div className="flex gap-2">
              {page > 1 ? (
                <Link
                  href={`/admin/members${queryString({ ...filters, page: page - 1 })}`}
                  className="rounded border border-gold/30 px-3 py-1.5 hover:border-gold"
                >
                  Previous
                </Link>
              ) : (
                <span className="rounded border border-gold/10 px-3 py-1.5 text-mist">
                  Previous
                </span>
              )}
              {page < pageCount ? (
                <Link
                  href={`/admin/members${queryString({ ...filters, page: page + 1 })}`}
                  className="rounded border border-gold/30 px-3 py-1.5 hover:border-gold"
                >
                  Next
                </Link>
              ) : (
                <span className="rounded border border-gold/10 px-3 py-1.5 text-mist">
                  Next
                </span>
              )}
            </div>
          </div>
        ) : null}
      </section>
    </div>
  );
}
