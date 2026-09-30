import { OrderStatusForm } from "@/components/admin/OrderStatusForm";
import { formatPrice } from "@/lib/format-price";
import { metalLabel } from "@/lib/metal-quotes";
import { tradeSideLabel } from "@/lib/order-math";
import { getOrdersForAdmin } from "@/lib/orders";

export const dynamic = "force-dynamic";

export default async function AdminOrdersPage() {
  const orders = await getOrdersForAdmin();

  return (
    <div>
      <h1 className="font-display text-4xl text-gold">Orders</h1>
      <p className="mt-2 mb-8 text-mist">
        Member MYR/KG buy &amp; sell orders (locked board price).
      </p>

      <div className="space-y-4">
        {orders.map((order) => (
          <article
            key={`${order.id}-${order.status}-${String(order.updatedAt)}`}
            className="rounded-xl border border-gold/20 p-6"
          >
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <h2 className="text-lg text-gold">{order.orderNo}</h2>
                <p className="mt-1 text-sm text-mist">
                  {order.member?.fullName} · {order.member?.memberId} · {order.member?.phone}
                </p>
                <p className="mt-1 text-xs text-mist">
                  {order.createdAt.toLocaleString()}
                </p>
              </div>
              <div className="text-right">
                <p className="text-lg tabular-nums">
                  RM {formatPrice(order.totalAmount, 2)}
                </p>
                <p className="mt-1 text-sm capitalize text-gold">{order.status}</p>
              </div>
            </div>

            <ul className="mt-4 space-y-2 text-sm">
              {order.items.map((item) => (
                <li
                  key={item.id || `${item.side}-${item.metal}-${item.qtyKg}`}
                  className="flex flex-wrap justify-between gap-2 border-t border-white/10 pt-2"
                >
                  <span>
                    {tradeSideLabel(item.side)} · {metalLabel(item.metal)} · {Number(item.qtyKg)}{" "}
                    kg @ RM {formatPrice(item.lockedPrice, 0)} / kg
                  </span>
                  <span className="tabular-nums">RM {formatPrice(item.lineTotal, 2)}</span>
                </li>
              ))}
            </ul>

            <OrderStatusForm orderId={order.id} status={order.status} />
          </article>
        ))}
        {orders.length === 0 ? <p className="text-mist">No orders yet.</p> : null}
      </div>
    </div>
  );
}
