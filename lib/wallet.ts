import "server-only";
import { execute, getPool, newId, query, queryOne } from "@/lib/db";
import { filterWalletRows, publicStatus, transferEffect, withdrawalEffect, withdrawalHold, type WalletRow } from "@/lib/wallet-math";

type Stamp = { createdAt: Date | string };

function iso(value: Date | string) {
  const date = value instanceof Date ? value : new Date(value);
  return date.toISOString();
}

export async function listWallet(memberId: number, asset: "xau" | "fund", filters: {
  method?: string;
  status?: string;
  from?: string;
  to?: string;
}) {
  const rows: WalletRow[] = [];
  const deposits = await query<{ id: string; kind: string; status: string; creditedAmount: unknown; createdAt: Date }>(
    "SELECT `id`,`kind`,`status`,`creditedAmount`,`createdAt` FROM `Deposit` WHERE `memberId`=? AND `kind`=?",
    [memberId, asset],
  );
  for (const row of deposits) {
    rows.push({
      id: row.id,
      asset,
      method: "deposit",
      status: publicStatus(row.status),
      amount: row.status === "approved" ? Number(row.creditedAmount) : null,
      createdAt: iso(row.createdAt),
    });
  }

  const withdrawals = await query<{ id: string; kind: string; status: string; amount: unknown; createdAt: Date }>(
    "SELECT `id`,`kind`,`status`,`amount`,`createdAt` FROM `Withdrawal` WHERE `memberId`=? AND `kind`=?",
    [memberId, asset],
  ).catch(() => []);
  for (const row of withdrawals) {
    rows.push({
      id: row.id,
      asset,
      method: "withdrawal",
      status: publicStatus(row.status),
      amount: Number(row.amount),
      createdAt: iso(row.createdAt),
    });
  }

  if (asset === "xau") {
    const transfers = await query<{ id: string; status: string; grams: unknown; createdAt: Date }>(
      "SELECT `id`,`status`,`grams`,`createdAt` FROM `GoldTransfer` WHERE `fromMemberId`=? OR `toMemberId`=?",
      [memberId, memberId],
    ).catch(() => []);
    for (const row of transfers) {
      rows.push({
        id: row.id,
        asset: "xau",
        method: "transfer",
        status: publicStatus(row.status),
        amount: Number(row.grams),
        createdAt: iso(row.createdAt),
      });
    }
  }

  rows.sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
  return filterWalletRows(rows, filters);
}

export async function listBankAccounts(memberId: number, approvedOnly = false) {
  const sql = approvedOnly
    ? "SELECT `id`,`holderName`,`bankName`,`accountNo`,`status`,`createdAt` FROM `BankAccount` WHERE `memberId`=? AND `status`='approved' ORDER BY `createdAt` DESC"
    : "SELECT `id`,`holderName`,`bankName`,`accountNo`,`status`,`createdAt` FROM `BankAccount` WHERE `memberId`=? ORDER BY `createdAt` DESC";
  return query<{ id: string; holderName: string; bankName: string; accountNo: string; status: string; createdAt: Date }>(sql, [memberId]);
}

export async function createBankAccount(memberId: number, input: { holderName: string; bankName: string; accountNo: string }) {
  const holderName = input.holderName.trim();
  const bankName = input.bankName.trim();
  const accountNo = input.accountNo.trim();
  if (!holderName || holderName.length > 120) throw new Error("Enter the account holder name.");
  if (!bankName || bankName.length > 120) throw new Error("Enter the bank name.");
  if (!accountNo || accountNo.length > 40) throw new Error("Enter the bank account.");
  const id = newId();
  await query(
    "INSERT INTO `BankAccount`(`id`,`memberId`,`holderName`,`bankName`,`accountNo`,`status`,`createdAt`,`updatedAt`) VALUES(?,?,?,?,?,'pending',NOW(3),NOW(3))",
    [id, memberId, holderName, bankName, accountNo],
  );
  return { id, status: "pending" as const };
}

export async function reviewBankAccount(id: string, decision: "approve" | "reject") {
  const status = decision === "approve" ? "approved" : "rejected";
  const result = await execute(
    "UPDATE `BankAccount` SET `status`=?,`reviewedAt`=NOW(3),`updatedAt`=NOW(3) WHERE `id`=? AND `status`='pending'",
    [status, id],
  );
  if (!result?.affectedRows) {
    const existing = await queryOne<{ id: string }>("SELECT `id` FROM `BankAccount` WHERE `id`=?", [id]);
    if (!existing) throw new Error("Bank account not found.");
    throw new Error("This bank account is already reviewed.");
  }
}

export async function getPendingWithdrawalCount() {
  const row = await queryOne<{ total: number }>(
    "SELECT COUNT(*) AS total FROM `Withdrawal` WHERE `status`='pending'",
  );
  return Number(row?.total ?? 0);
}

export async function createWithdrawal(memberId: number, input: { kind: "xau" | "fund"; amount: number; bankAccountId?: string }) {
  let bankAccountId: string | null = null;
  if (input.kind === "fund") {
    if (!input.bankAccountId) throw new Error("Select a verified bank account.");
    const account = await queryOne<{ id: string }>(
      "SELECT `id` FROM `BankAccount` WHERE `id`=? AND `memberId`=? AND `status`='approved'",
      [input.bankAccountId, memberId],
    );
    if (!account) throw new Error("Select a verified bank account.");
    bankAccountId = account.id;
  }
  const conn = await getPool().getConnection();
  try {
    await conn.beginTransaction();
    const members = (await conn.query(
      "SELECT `xauGrams`,`fundMyr` FROM `Member` WHERE `id`=? LIMIT 1 FOR UPDATE",
      [memberId],
    )) as { xauGrams: unknown; fundMyr: unknown }[];
    const member = members[0];
    if (!member) throw new Error("Member not found.");
    const balance = input.kind === "xau" ? Number(member.xauGrams) : Number(member.fundMyr);
    const hold = withdrawalHold({ kind: input.kind, amount: input.amount, balance });
    if (!hold.ok) throw new Error(hold.error);
    const id = newId();
    const column = input.kind === "xau" ? "xauGrams" : "fundMyr";
    await conn.query(
      "INSERT INTO `Withdrawal`(`id`,`memberId`,`kind`,`amount`,`status`,`bankAccountId`,`createdAt`,`updatedAt`) VALUES(?,?,?,?,'pending',?,NOW(3),NOW(3))",
      [id, memberId, input.kind, input.amount, bankAccountId],
    );
    await conn.query(`UPDATE \`Member\` SET \`${column}\`=?, \`updatedAt\`=NOW(3) WHERE \`id\`=?`, [hold.balance, memberId]);
    await conn.commit();
    return { id, status: "pending" as const, balance: hold.balance };
  } catch (error) {
    await conn.rollback();
    throw error;
  } finally {
    conn.release();
  }
}

export async function reviewWithdrawal(id: string, decision: "approve" | "reject", reviewerId: string) {
  const conn = await getPool().getConnection();
  try {
    await conn.beginTransaction();
    const rows = (await conn.query(
      `SELECT w.\`id\`, w.\`memberId\`, w.\`kind\`, w.\`amount\`, w.\`status\`, m.\`xauGrams\`, m.\`fundMyr\`
       FROM \`Withdrawal\` w JOIN \`Member\` m ON m.\`id\`=w.\`memberId\` WHERE w.\`id\`=? LIMIT 1 FOR UPDATE`,
      [id],
    )) as { id: string; memberId: number; kind: string; amount: unknown; status: string; xauGrams: unknown; fundMyr: unknown }[];
    const row = rows[0];
    if (!row) throw new Error("Withdrawal not found.");
    const kind = row.kind === "fund" ? "fund" : "xau";
    const balance = kind === "xau" ? Number(row.xauGrams) : Number(row.fundMyr);
    const effect = withdrawalEffect({ status: row.status, kind, amount: Number(row.amount), balance, decision });
    if (!effect.ok) throw new Error(effect.error);
    if (effect.status === "rejected") {
      const column = kind === "xau" ? "xauGrams" : "fundMyr";
      await conn.query(`UPDATE \`Member\` SET \`${column}\`=?, \`updatedAt\`=NOW(3) WHERE \`id\`=?`, [effect.balance, row.memberId]);
    }
    const updated = await conn.query(
      "UPDATE `Withdrawal` SET `status`=?,`reviewedBy`=?,`reviewedAt`=NOW(3),`updatedAt`=NOW(3) WHERE `id`=? AND `status`='pending'",
      [effect.status, reviewerId, row.id],
    );
    if (!updated?.affectedRows) throw new Error("This withdrawal is already reviewed.");
    await conn.commit();
  } catch (error) {
    await conn.rollback();
    throw error;
  } finally {
    conn.release();
  }
}

export async function createTransfer(memberId: number, username: string, grams: number) {
  const name = username.trim();
  if (!name) throw new Error("Enter a username.");
  if (!(grams > 0)) throw new Error("Enter a quantity greater than 0.");
  const sender = await queryOne<{ id: number; username: string; xauGrams: unknown }>(
    "SELECT `id`,`username`,`xauGrams` FROM `Member` WHERE `id`=?",
    [memberId],
  );
  if (!sender) throw new Error("Member not found.");
  if (sender.username.toLowerCase() === name.toLowerCase()) throw new Error("You cannot transfer gold to yourself.");
  const recipient = await queryOne<{ id: number }>(
    "SELECT `id` FROM `Member` WHERE `username`=? AND `isActive`=1 LIMIT 1",
    [name],
  );
  if (!recipient) throw new Error("That username was not found.");
  if (Number(sender.xauGrams) < grams) throw new Error("Amount is above your gold balance.");
  const id = newId();
  await query(
    "INSERT INTO `GoldTransfer`(`id`,`fromMemberId`,`toMemberId`,`grams`,`status`,`createdAt`,`updatedAt`) VALUES(?,?,?,?,'pending',NOW(3),NOW(3))",
    [id, sender.id, recipient.id, grams],
  );
  return { id, status: "pending" as const };
}

export async function reviewTransfer(id: string, decision: "approve" | "reject", reviewerId: string) {
  const conn = await getPool().getConnection();
  try {
    await conn.beginTransaction();
    const rows = (await conn.query(
      `SELECT t.\`id\`, t.\`fromMemberId\`, t.\`toMemberId\`, t.\`grams\`, t.\`status\`,
              s.\`xauGrams\` AS senderGrams, r.\`xauGrams\` AS recipientGrams
       FROM \`GoldTransfer\` t
       JOIN \`Member\` s ON s.\`id\`=t.\`fromMemberId\`
       JOIN \`Member\` r ON r.\`id\`=t.\`toMemberId\`
       WHERE t.\`id\`=? LIMIT 1 FOR UPDATE`,
      [id],
    )) as { id: string; fromMemberId: number; toMemberId: number; grams: unknown; status: string; senderGrams: unknown; recipientGrams: unknown }[];
    const row = rows[0];
    if (!row) throw new Error("Transfer not found.");
    const effect = transferEffect({
      status: row.status,
      grams: Number(row.grams),
      sender: Number(row.senderGrams),
      recipient: Number(row.recipientGrams),
      decision,
    });
    if (!effect.ok) throw new Error(effect.error);
    if (effect.status === "approved") {
      await conn.query("UPDATE `Member` SET `xauGrams`=?,`updatedAt`=NOW(3) WHERE `id`=?", [effect.sender, row.fromMemberId]);
      await conn.query("UPDATE `Member` SET `xauGrams`=?,`updatedAt`=NOW(3) WHERE `id`=?", [effect.recipient, row.toMemberId]);
    }
    const updated = await conn.query(
      "UPDATE `GoldTransfer` SET `status`=?,`reviewedBy`=?,`reviewedAt`=NOW(3),`updatedAt`=NOW(3) WHERE `id`=? AND `status`='pending'",
      [effect.status, reviewerId, row.id],
    );
    if (!updated?.affectedRows) throw new Error("This transfer is already reviewed.");
    await conn.commit();
  } catch (error) {
    await conn.rollback();
    throw error;
  } finally {
    conn.release();
  }
}

export async function listAnnouncements(activeOnly: boolean) {
  const sql = activeOnly
    ? "SELECT `id`,`title`,`body`,`isActive`,`createdAt` FROM `Announcement` WHERE `isActive`=1 ORDER BY `createdAt` DESC"
    : "SELECT `id`,`title`,`body`,`isActive`,`createdAt` FROM `Announcement` ORDER BY `createdAt` DESC";
  return query<{ id: string; title: string; body: string; isActive: unknown; createdAt: Date }>(sql);
}

export async function listMemberAnnouncements(memberId: number) {
  const rows = await query<{ id: string; title: string; body: string; createdAt: Date; readAt: Date | null }>(
    `SELECT a.\`id\`, a.\`title\`, a.\`body\`, a.\`createdAt\`, r.\`readAt\`
     FROM \`Announcement\` a
     LEFT JOIN \`AnnouncementRead\` r ON r.\`announcementId\` = a.\`id\` AND r.\`memberId\` = ?
     WHERE a.\`isActive\` = 1
     ORDER BY a.\`createdAt\` DESC`,
    [memberId],
  );
  const announcements = rows.map((row) => ({
    id: row.id,
    title: row.title,
    body: row.body,
    createdAt: row.createdAt instanceof Date ? row.createdAt.toISOString() : new Date(row.createdAt).toISOString(),
    read: row.readAt != null,
  }));
  return {
    announcements,
    unreadCount: announcements.filter((row) => !row.read).length,
  };
}

export async function markAnnouncementRead(memberId: number, announcementId: string) {
  const announcement = await queryOne<{ id: string }>(
    "SELECT `id` FROM `Announcement` WHERE `id`=? AND `isActive`=1",
    [announcementId],
  );
  if (!announcement) throw new Error("Announcement not found.");
  await query(
    "INSERT INTO `AnnouncementRead`(`memberId`,`announcementId`,`readAt`) VALUES(?,?,NOW(3)) ON DUPLICATE KEY UPDATE `readAt`=`readAt`",
    [memberId, announcementId],
  );
}

export async function createAnnouncement(title: string, body: string) {
  const nextTitle = title.trim();
  const nextBody = body.trim();
  if (!nextTitle || nextTitle.length > 120) throw new Error("Enter a title up to 120 characters.");
  if (!nextBody || nextBody.length > 2000) throw new Error("Enter a message up to 2000 characters.");
  const id = newId();
  await query(
    "INSERT INTO `Announcement`(`id`,`title`,`body`,`isActive`,`createdAt`,`updatedAt`) VALUES(?,?,?,1,NOW(3),NOW(3))",
    [id, nextTitle, nextBody],
  );
  return { id };
}

export async function setAnnouncementActive(id: string, isActive: boolean) {
  await query("UPDATE `Announcement` SET `isActive`=?,`updatedAt`=NOW(3) WHERE `id`=?", [isActive ? 1 : 0, id]);
}

export type { Stamp };
