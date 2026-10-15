export type WalletMethod = "deposit" | "withdrawal" | "transfer";
export type WalletStatus = "pending" | "declined" | "approved";

export type WalletRow = {
  id: string;
  asset: "xau" | "fund";
  method: WalletMethod;
  status: WalletStatus;
  amount: number | null;
  createdAt: string;
};

export type WalletQuery = {
  method?: string;
  status?: string;
  from?: string;
  to?: string;
};

export function tradingLimitError(raw: string) {
  const text = raw.trim();
  if (!text) return null;
  const value = Number(text);
  if (!Number.isFinite(value) || value < 0) return "Trading limit must be 0 or more.";
  return null;
}

export function publicStatus(status: string): WalletStatus {
  if (status === "approved") return "approved";
  if (status === "rejected" || status === "declined") return "declined";
  return "pending";
}

export function filterWalletRows(rows: WalletRow[], query: WalletQuery) {
  return rows.filter((row) => {
    if (query.method && row.method !== query.method) return false;
    if (query.status && row.status !== query.status) return false;
    const day = row.createdAt.slice(0, 10);
    if (query.from && day < query.from) return false;
    if (query.to && day > query.to) return false;
    return true;
  });
}

export function withdrawalHold(input: { kind: "xau" | "fund"; amount: number; balance: number }) {
  if (!(input.amount > 0)) return { ok: false as const, error: "Enter an amount greater than 0." };
  if (input.amount > input.balance) return { ok: false as const, error: "Amount is above your balance." };
  const next = input.kind === "xau" ? round6(input.balance - input.amount) : round2(input.balance - input.amount);
  return { ok: true as const, balance: next };
}

export function withdrawalEffect(input: {
  status: string;
  kind: "xau" | "fund";
  amount: number;
  balance: number;
  decision: "approve" | "reject";
}) {
  if (input.status !== "pending") return { ok: false as const, error: "This withdrawal is already reviewed." };
  if (input.decision === "approve") {
    return { ok: true as const, status: "approved" as const, balance: input.balance };
  }
  const next = input.kind === "xau" ? round6(input.balance + input.amount) : round2(input.balance + input.amount);
  return { ok: true as const, status: "rejected" as const, balance: next };
}

export function transferEffect(input: {
  status: string;
  grams: number;
  sender: number;
  recipient: number;
  decision: "approve" | "reject";
}) {
  if (input.status !== "pending") return { ok: false as const, error: "This transfer is already reviewed." };
  if (input.decision === "reject") {
    return { ok: true as const, status: "rejected" as const, sender: input.sender, recipient: input.recipient };
  }
  if (!(input.grams > 0) || input.grams > input.sender) {
    return { ok: false as const, error: "Not enough gold." };
  }
  return {
    ok: true as const,
    status: "approved" as const,
    sender: round6(input.sender - input.grams),
    recipient: round6(input.recipient + input.grams),
  };
}

function round2(value: number) {
  return Math.round(value * 100) / 100;
}

function round6(value: number) {
  return Math.round(value * 1_000_000) / 1_000_000;
}
