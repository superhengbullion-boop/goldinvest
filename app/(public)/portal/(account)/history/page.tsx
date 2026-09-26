import Link from "next/link";
import { HistoryLimitSelect } from "@/components/HistoryLimitSelect";
import { PurchaseHistory } from "@/components/PurchaseHistory";
import { getMember } from "@/lib/member-session";
import { getOrdersPageForMember, normalizeHistoryLimit } from "@/lib/orders";

function historyQuery(params: { page?: number; limit?: number }) {
  const search = new URLSearchParams();
  if (params.limit && params.limit !== 10) search.set("limit", String(params.limit));
  if (params.page && params.page > 1) search.set("page", String(params.page));
  const text = search.toString();
  return text ? `?${text}` : "";
}

export default async function PortalHistoryPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; limit?: string }>;
}) {
  const member = await getMember();
  if (!member) return null;

  const params = await searchParams;
  const limit = normalizeHistoryLimit(params.limit);
  const requestedPage = Math.max(1, Number(params.page) || 1);

  const { orders, total, page, pageCount, pageSize } = await getOrdersPageForMember(
    member.id,
    { page: requestedPage, limit },
  ).catch(() => ({
    orders: [],
    total: 0,
    page: 1,
    pageCount: 1,
    pageSize: limit,
  }));

  return (
    <section>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="font-display text-2xl text-gold">Purchase History</h2>
          <p className="mt-2 text-sm text-mist">Your MYR/KG orders and current status.</p>
        </div>
        <div className="flex flex-wrap items-center gap-4">
          <p className="text-sm text-mist">
            {total} order{total === 1 ? "" : "s"}
          </p>
          <HistoryLimitSelect limit={pageSize} page={page} />
        </div>
      </div>

      <div className="mt-6">
        <PurchaseHistory orders={orders} />
      </div>

      {total > 0 ? (
        <div className="mt-6 flex flex-wrap items-center justify-between gap-3 text-sm">
          <p className="text-mist">
            Page {page} of {pageCount}
          </p>
          <div className="flex gap-2">
            {page > 1 ? (
              <Link
                href={`/portal/history${historyQuery({ page: page - 1, limit: pageSize })}`}
                className="rounded border border-gold/30 px-3 py-1.5 hover:border-gold"
              >
                Previous
              </Link>
            ) : (
              <span className="rounded border border-gold/10 px-3 py-1.5 text-mist">Previous</span>
            )}
            {page < pageCount ? (
              <Link
                href={`/portal/history${historyQuery({ page: page + 1, limit: pageSize })}`}
                className="rounded border border-gold/30 px-3 py-1.5 hover:border-gold"
              >
                Next
              </Link>
            ) : (
              <span className="rounded border border-gold/10 px-3 py-1.5 text-mist">Next</span>
            )}
          </div>
        </div>
      ) : null}
    </section>
  );
}
