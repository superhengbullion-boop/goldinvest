import "server-only";
import { getPool, execute, query, queryOne, newId } from "@/lib/db";
import { getZonedNow } from "@/lib/rate-time";
import { metalLabel } from "@/lib/metal-quotes";
import { lineTotalMyr, normalizeHistoryLimit, ORDER_STATUSES, type OrderStatus } from "@/lib/order-math";

export {
  lineTotalMyr,
  HISTORY_PAGE_LIMITS,
  normalizeHistoryLimit,
  ORDER_STATUSES,
} from "@/lib/order-math";
export type { OrderStatus } from "@/lib/order-math";
export const CART_UNIT_KEY = "myr-kg";

export type CartItemRow = {
  id: string;
  memberId: number;
  metal: string;
  unitKey: string;
  lockedSellPrice: string | number;
  qtyKg: string | number;
  createdAt: Date;
  updatedAt: Date;
};

export type OrderItemRow = {
  id: string;
  orderId: string;
  metal: string;
  unitKey: string;
  lockedSellPrice: string | number;
  qtyKg: string | number;
  lineTotal: string | number;
};

export type OrderRow = {
  id: string;
  orderNo: string;
  memberId: number;
  status: string;
  totalAmount: string | number;
  createdAt: Date;
  updatedAt: Date;
};

export type OrderWithItems = OrderRow & {
  items: OrderItemRow[];
  member?: {
    memberId: string;
    fullName: string;
    phone: string;
    email: string;
    username: string;
  };
};

function num(value: string | number) {
  return Number(value);
}

export async function getCartItems(memberId: number): Promise<CartItemRow[]> {
  return query<CartItemRow>(
    "SELECT * FROM `CartItem` WHERE `memberId`=? ORDER BY `createdAt` ASC",
    [memberId],
  );
}

export async function getCartItemCount(memberId: number): Promise<number> {
  const row = await queryOne<{ total: number }>(
    "SELECT COUNT(*) AS total FROM `CartItem` WHERE `memberId`=?",
    [memberId],
  );
  return Number(row?.total ?? 0);
}

export async function upsertCartItem(input: {
  memberId: number;
  metal: string;
  lockedSellPrice: number;
  qtyKg: number;
}) {
  const metal = input.metal === "XAG" ? "XAG" : "XAU";
  if (!(input.lockedSellPrice > 0) || !(input.qtyKg > 0)) {
    throw new Error("Price and quantity must be greater than zero.");
  }

  const existing = await queryOne<CartItemRow>(
    "SELECT * FROM `CartItem` WHERE `memberId`=? AND `metal`=? AND `unitKey`=? LIMIT 1",
    [input.memberId, metal, CART_UNIT_KEY],
  );

  if (existing) {
    const nextQty = num(existing.qtyKg) + input.qtyKg;
    await execute(
      "UPDATE `CartItem` SET `lockedSellPrice`=?,`qtyKg`=?,`updatedAt`=NOW(3) WHERE `id`=?",
      [input.lockedSellPrice, nextQty, existing.id],
    );
    return existing.id;
  }

  const id = newId();
  await execute(
    `INSERT INTO \`CartItem\`(\`id\`,\`memberId\`,\`metal\`,\`unitKey\`,\`lockedSellPrice\`,\`qtyKg\`,\`createdAt\`,\`updatedAt\`)
     VALUES(?,?,?,?,?,?,NOW(3),NOW(3))`,
    [id, input.memberId, metal, CART_UNIT_KEY, input.lockedSellPrice, input.qtyKg],
  );
  return id;
}

export async function updateCartItemQty(memberId: number, itemId: string, qtyKg: number) {
  if (!(qtyKg > 0)) throw new Error("Quantity must be greater than zero.");
  const result = await execute(
    "UPDATE `CartItem` SET `qtyKg`=?,`updatedAt`=NOW(3) WHERE `id`=? AND `memberId`=?",
    [qtyKg, itemId, memberId],
  );
  if (!result?.affectedRows) throw new Error("Cart item not found.");
}

export async function removeCartItem(memberId: number, itemId: string) {
  await execute("DELETE FROM `CartItem` WHERE `id`=? AND `memberId`=?", [itemId, memberId]);
}

async function nextOrderNo(conn: { query: (sql: string, params?: unknown[]) => Promise<unknown> }) {
  const { date } = getZonedNow();
  const stamp = date.replaceAll("-", "");
  const prefix = `SHB-${stamp}-`;
  const rows = (await conn.query(
    "SELECT `orderNo` FROM `Order` WHERE `orderNo` LIKE ? ORDER BY `orderNo` DESC LIMIT 1",
    [`${prefix}%`],
  )) as Array<{ orderNo: string }>;
  const last = rows[0]?.orderNo;
  const seq = last ? Number(last.slice(prefix.length)) + 1 : 1;
  return `${prefix}${String(Number.isFinite(seq) ? seq : 1).padStart(4, "0")}`;
}

export async function placeOrder(memberId: number): Promise<OrderWithItems> {
  const cart = await getCartItems(memberId);
  if (cart.length === 0) throw new Error("Your cart is empty.");

  const items = cart.map((item) => {
    const lockedSellPrice = num(item.lockedSellPrice);
    const qtyKg = num(item.qtyKg);
    return {
      metal: item.metal,
      unitKey: item.unitKey,
      lockedSellPrice,
      qtyKg,
      lineTotal: lineTotalMyr(lockedSellPrice, qtyKg),
    };
  });
  const totalAmount = Math.round(items.reduce((sum, item) => sum + item.lineTotal, 0) * 100) / 100;

  const conn = await getPool().getConnection();
  try {
    await conn.beginTransaction();
    const orderNo = await nextOrderNo(conn);
    const orderId = newId();

    await conn.query(
      `INSERT INTO \`Order\`(\`id\`,\`orderNo\`,\`memberId\`,\`status\`,\`totalAmount\`,\`createdAt\`,\`updatedAt\`)
       VALUES(?,?,?,?,?,NOW(3),NOW(3))`,
      [orderId, orderNo, memberId, "pending", totalAmount],
    );

    for (const item of items) {
      await conn.query(
        `INSERT INTO \`OrderItem\`(\`id\`,\`orderId\`,\`metal\`,\`unitKey\`,\`lockedSellPrice\`,\`qtyKg\`,\`lineTotal\`)
         VALUES(?,?,?,?,?,?,?)`,
        [newId(), orderId, item.metal, item.unitKey, item.lockedSellPrice, item.qtyKg, item.lineTotal],
      );
    }

    await conn.query("DELETE FROM `CartItem` WHERE `memberId`=?", [memberId]);
    await conn.commit();

    return {
      id: orderId,
      orderNo,
      memberId,
      status: "pending",
      totalAmount,
      createdAt: new Date(),
      updatedAt: new Date(),
      items: items.map((item) => ({
        id: "",
        orderId,
        metal: item.metal,
        unitKey: item.unitKey,
        lockedSellPrice: item.lockedSellPrice,
        qtyKg: item.qtyKg,
        lineTotal: item.lineTotal,
      })),
    };
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
}

export function summarizeOrderItems(items: OrderItemRow[]) {
  return items
    .map((item) => `${metalLabel(item.metal)} ${num(item.qtyKg)} kg`)
    .join(", ");
}

export async function getOrdersPageForMember(
  memberId: number,
  opts: { page?: number; limit?: number } = {},
): Promise<{
  orders: OrderWithItems[];
  total: number;
  page: number;
  pageCount: number;
  pageSize: number;
}> {
  const pageSize = normalizeHistoryLimit(opts.limit);
  const countRow = await queryOne<{ total: number }>(
    "SELECT COUNT(*) AS total FROM `Order` WHERE `memberId`=?",
    [memberId],
  );
  const total = Number(countRow?.total ?? 0);
  const pageCount = Math.max(1, Math.ceil(total / pageSize));
  const page = Math.min(pageCount, Math.max(1, opts.page ?? 1));
  const offset = (page - 1) * pageSize;

  const orders = await query<OrderRow>(
    `SELECT * FROM \`Order\` WHERE \`memberId\`=? ORDER BY \`createdAt\` DESC LIMIT ${pageSize} OFFSET ${offset}`,
    [memberId],
  );

  if (orders.length === 0) {
    return { orders: [], total, page, pageCount, pageSize };
  }

  const ids = orders.map((o) => o.id);
  const placeholders = ids.map(() => "?").join(",");
  const items = await query<OrderItemRow>(
    `SELECT * FROM \`OrderItem\` WHERE \`orderId\` IN (${placeholders})`,
    ids,
  );

  return {
    orders: orders.map((order) => ({
      ...order,
      items: items.filter((item) => item.orderId === order.id),
    })),
    total,
    page,
    pageCount,
    pageSize,
  };
}

/** @deprecated Prefer getOrdersPageForMember */
export async function getOrdersForMember(memberId: number): Promise<OrderWithItems[]> {
  const { orders } = await getOrdersPageForMember(memberId, { page: 1, limit: 50 });
  return orders;
}

export async function getOrdersForAdmin(): Promise<OrderWithItems[]> {
  const orders = await query<
    OrderRow & {
      mMemberId: string;
      mFullName: string;
      mPhone: string;
      mEmail: string;
      mUsername: string;
    }
  >(
    `SELECT o.*,
            m.\`memberId\` AS mMemberId,
            m.\`fullName\` AS mFullName,
            m.\`phone\` AS mPhone,
            m.\`email\` AS mEmail,
            m.\`username\` AS mUsername
     FROM \`Order\` o
     INNER JOIN \`Member\` m ON m.\`id\`=o.\`memberId\`
     ORDER BY o.\`createdAt\` DESC`,
  );

  if (orders.length === 0) return [];

  const ids = orders.map((o) => o.id);
  const placeholders = ids.map(() => "?").join(",");
  const items = await query<OrderItemRow>(
    `SELECT * FROM \`OrderItem\` WHERE \`orderId\` IN (${placeholders})`,
    ids,
  );

  return orders.map((order) => ({
    id: order.id,
    orderNo: order.orderNo,
    memberId: order.memberId,
    status: order.status,
    totalAmount: order.totalAmount,
    createdAt: order.createdAt,
    updatedAt: order.updatedAt,
    member: {
      memberId: order.mMemberId,
      fullName: order.mFullName,
      phone: order.mPhone,
      email: order.mEmail,
      username: order.mUsername,
    },
    items: items.filter((item) => item.orderId === order.id),
  }));
}

export async function getPendingOrderCount(): Promise<number> {
  const row = await queryOne<{ total: number }>(
    "SELECT COUNT(*) AS total FROM `Order` WHERE `status`='pending'",
  );
  return Number(row?.total ?? 0);
}

export async function updateOrderStatus(orderId: string, status: OrderStatus) {
  if (!ORDER_STATUSES.includes(status)) {
    throw new Error("Invalid order status.");
  }
  const result = await execute(
    "UPDATE `Order` SET `status`=?,`updatedAt`=NOW(3) WHERE `id`=?",
    [status, orderId],
  );
  if (!result?.affectedRows) throw new Error("Order not found.");
}
