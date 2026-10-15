import "server-only";
import { mkdir, writeFile } from "node:fs/promises";
import { getPool, newId, query, queryOne } from "@/lib/db";
import { decideDeposit, proofExtension, proofFileError } from "@/lib/deposit-math";
import { getUploadFilePath, getUploadsDir } from "@/lib/uploads";

export type DepositRecord = {
  id: string;
  memberId: number;
  memberCode: string;
  fullName: string;
  phone: string;
  kind: string;
  status: string;
  comment: string | null;
  proofPath: string | null;
  creditedAmount: number | null;
  createdAt: Date;
};

type ReviewRow = {
  id: string;
  memberId: number;
  kind: string;
  status: string;
  xauGrams: unknown;
  fundMyr: unknown;
};

export async function getPendingDepositCount() {
  const row = await queryOne<{ total: number }>(
    "SELECT COUNT(*) AS total FROM `Deposit` WHERE `status`='pending'",
  );
  return Number(row?.total ?? 0);
}

export async function listDeposits(): Promise<DepositRecord[]> {
  const rows = await query<DepositRecord & { creditedAmount: unknown }>(
    `SELECT d.\`id\`, d.\`memberId\`, m.\`memberId\` AS memberCode, m.\`fullName\`, m.\`phone\`,
            d.\`kind\`, d.\`status\`, d.\`comment\`, d.\`proofPath\`, d.\`creditedAmount\`, d.\`createdAt\`
     FROM \`Deposit\` d
     JOIN \`Member\` m ON m.\`id\` = d.\`memberId\`
     ORDER BY d.\`createdAt\` DESC
     LIMIT 100`,
  );
  return rows.map((row) => ({
    ...row,
    createdAt: row.createdAt instanceof Date ? row.createdAt : new Date(row.createdAt),
    creditedAmount: row.creditedAmount == null ? null : Number(row.creditedAmount),
  }));
}

export async function createDeposit(input: {
  memberId: number;
  kind: "xau" | "fund";
  comment?: string;
  proofPath?: string | null;
  bankAccountId?: string | null;
}) {
  if (input.bankAccountId) {
    const account = await queryOne<{ id: string }>(
      "SELECT `id` FROM `BankAccount` WHERE `id`=? AND `memberId`=? AND `status`='approved' LIMIT 1",
      [input.bankAccountId, input.memberId],
    );
    if (!account) throw new Error("Select a verified bank account.");
  }
  const id = newId();
  const comment = input.comment?.trim() ?? "";
  if (comment.length > 500) throw new Error("Keep the comment under 500 characters.");
  await query(
    `INSERT INTO \`Deposit\`(\`id\`,\`memberId\`,\`kind\`,\`status\`,\`comment\`,\`proofPath\`,\`bankAccountId\`,\`createdAt\`,\`updatedAt\`)
     VALUES(?,?,?,'pending',?,?,?,NOW(3),NOW(3))`,
    [id, input.memberId, input.kind, comment || null, input.proofPath ?? null, input.bankAccountId ?? null],
  );
  return { id, status: "pending" as const };
}

export async function saveDepositProof(file: File) {
  const bytes = Buffer.from(await file.arrayBuffer());
  const error = proofFileError({
    type: file.type,
    name: file.name,
    size: bytes.length,
    bytes,
  });
  if (error) throw new Error(error);
  const ext = proofExtension(bytes);
  if (!ext) throw new Error("Use a JPG or PNG file.");
  const name = `${newId()}.${ext}`;
  await mkdir(getUploadsDir(), { recursive: true });
  await writeFile(getUploadFilePath(name), bytes);
  return `/uploads/${name}`;
}

export async function reviewDeposit(input: {
  id: string;
  decision: "approve" | "reject";
  amount: number | null;
  reviewerId: string;
}) {
  const conn = await getPool().getConnection();
  try {
    await conn.beginTransaction();
    const rows = (await conn.query(
      `SELECT d.\`id\`, d.\`memberId\`, d.\`kind\`, d.\`status\`, m.\`xauGrams\`, m.\`fundMyr\`
       FROM \`Deposit\` d
       JOIN \`Member\` m ON m.\`id\` = d.\`memberId\`
       WHERE d.\`id\`=?
       LIMIT 1
       FOR UPDATE`,
      [input.id],
    )) as ReviewRow[];
    const row = rows[0];
    if (!row) throw new Error("Deposit not found.");

    const decision = decideDeposit({
      status: row.status,
      kind: row.kind,
      balances: {
        xauGrams: Number(row.xauGrams) || 0,
        fundMyr: Number(row.fundMyr) || 0,
      },
      decision: input.decision,
      amount: input.amount,
    });
    if (!decision.ok) throw new Error(decision.error);

    if (decision.status === "approved") {
      await conn.query(
        "UPDATE `Member` SET `xauGrams`=?, `fundMyr`=?, `updatedAt`=NOW(3) WHERE `id`=?",
        [decision.balances.xauGrams, decision.balances.fundMyr, row.memberId],
      );
      const updated = await conn.query(
        `UPDATE \`Deposit\`
         SET \`status\`='approved', \`creditedAmount\`=?, \`reviewedBy\`=?, \`reviewedAt\`=NOW(3), \`updatedAt\`=NOW(3)
         WHERE \`id\`=? AND \`status\`='pending'`,
        [decision.creditedAmount, input.reviewerId, row.id],
      );
      if (!updated?.affectedRows) throw new Error("This deposit is already reviewed.");
    } else {
      const updated = await conn.query(
        `UPDATE \`Deposit\`
         SET \`status\`='rejected', \`reviewedBy\`=?, \`reviewedAt\`=NOW(3), \`updatedAt\`=NOW(3)
         WHERE \`id\`=? AND \`status\`='pending'`,
        [input.reviewerId, row.id],
      );
      if (!updated?.affectedRows) throw new Error("This deposit is already reviewed.");
    }
    await conn.commit();
  } catch (error) {
    await conn.rollback();
    throw error;
  } finally {
    conn.release();
  }
}
