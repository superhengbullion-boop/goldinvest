import { formatPrice } from "@/lib/format-price";
import { metalLabel } from "@/lib/metal-quotes";
import type { OrderWithItems } from "@/lib/orders";

function statusLabel(status: string) {
  return status.charAt(0).toUpperCase() + status.slice(1);
}

function statusClass(status: string) {
  switch (status) {
    case "confirmed":
      return "text-gold";
    case "completed":
      return "text-emerald-400";
    case "cancelled":
      return "text-red-400";
    default:
      return "text-amber-300";
  }
}

export function PurchaseHistory({ orders }: { orders: OrderWithItems[] }) {
  if (orders.length === 0) {
    return <p className="text-mist">No purchases yet.</p>;
  }

  return (
    <ul className="divide-y divide-white/10 border-y border-white/10">
      {orders.map((order) => (
        <li key={order.id} className="py-5">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="font-medium text-gold">{order.orderNo}</p>
              <p className="mt-1 text-xs text-mist">{order.createdAt.toLocaleString()}</p>
            </div>
            <div className="text-right">
              <p className={`text-sm font-medium ${statusClass(order.status)}`}>
                {statusLabel(order.status)}
              </p>
              <p className="mt-1 text-sm tabular-nums">
                RM {formatPrice(order.totalAmount, 2)}
              </p>
            </div>
          </div>
          <ul className="mt-3 space-y-1 text-sm text-ivory/90">
            {order.items.map((item) => (
              <li
                key={item.id || `${order.id}-${item.metal}`}
                className="flex flex-wrap justify-between gap-2"
              >
                <span>
                  {metalLabel(item.metal)} · {Number(item.qtyKg)} kg @ RM{" "}
                  {formatPrice(item.lockedSellPrice, 0)} / kg
                </span>
                <span className="tabular-nums text-mist">
                  RM {formatPrice(item.lineTotal, 2)}
                </span>
              </li>
            ))}
          </ul>
        </li>
      ))}
    </ul>
  );
}
