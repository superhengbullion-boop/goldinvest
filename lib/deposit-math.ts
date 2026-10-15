export type DepositKind = "xau" | "fund";
export type DepositStatus = "pending" | "approved" | "rejected";

export type DepositBalances = {
  xauGrams: number;
  fundMyr: number;
};

export type DepositDecision =
  | {
      ok: true;
      status: "approved";
      creditedAmount: number;
      balances: DepositBalances;
    }
  | {
      ok: true;
      status: "rejected";
      creditedAmount: null;
      balances: DepositBalances;
    }
  | { ok: false; error: string };

const PROOF_MAX_BYTES = 5 * 1024 * 1024;

export function proofFileError(input: {
  type: string;
  name: string;
  size: number;
  bytes?: Uint8Array;
}) {
  const type = input.type.toLowerCase();
  const name = input.name.toLowerCase();
  const looksJpeg =
    type === "image/jpeg" || type === "image/jpg" || name.endsWith(".jpg") || name.endsWith(".jpeg");
  const looksPng = type === "image/png" || name.endsWith(".png");
  if (!looksJpeg && !looksPng) return "Use a JPG or PNG file.";
  if (input.size <= 0) return "Please choose a file.";
  if (input.size > PROOF_MAX_BYTES) return "File must be under 5MB.";
  if (!input.bytes) return null;
  const jpeg = isJpeg(input.bytes);
  const png = isPng(input.bytes);
  if (jpeg || png) return null;
  return "Use a JPG or PNG file.";
}

export function proofExtension(bytes: Uint8Array) {
  if (isPng(bytes)) return "png";
  if (isJpeg(bytes)) return "jpg";
  return null;
}

export function decideDeposit(input: {
  status: string;
  kind: string;
  balances: DepositBalances;
  decision: "approve" | "reject";
  amount: number | null;
}): DepositDecision {
  if (input.status !== "pending") {
    return { ok: false, error: "This deposit is already reviewed." };
  }
  if (input.kind !== "xau" && input.kind !== "fund") {
    return { ok: false, error: "Unknown deposit type." };
  }
  const balances = {
    xauGrams: round6(input.balances.xauGrams),
    fundMyr: round2(input.balances.fundMyr),
  };
  if (input.decision === "reject") {
    return { ok: true, status: "rejected", creditedAmount: null, balances };
  }
  const amount = input.amount;
  if (amount == null || !Number.isFinite(amount) || amount <= 0) {
    return {
      ok: false,
      error: input.kind === "xau" ? "Enter the gold weight in grams." : "Enter the amount in RM.",
    };
  }
  const credited = input.kind === "xau" ? round6(amount) : round2(amount);
  if (credited <= 0) {
    return {
      ok: false,
      error: input.kind === "xau" ? "Enter the gold weight in grams." : "Enter the amount in RM.",
    };
  }
  if (input.kind === "xau") balances.xauGrams = round6(balances.xauGrams + credited);
  else balances.fundMyr = round2(balances.fundMyr + credited);
  return { ok: true, status: "approved", creditedAmount: credited, balances };
}

function round2(value: number) {
  return Math.round(value * 100) / 100;
}

function round6(value: number) {
  return Math.round(value * 1_000_000) / 1_000_000;
}

function isJpeg(bytes: Uint8Array) {
  return bytes.length >= 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff;
}

function isPng(bytes: Uint8Array) {
  return (
    bytes.length >= 8 &&
    bytes[0] === 0x89 &&
    bytes[1] === 0x50 &&
    bytes[2] === 0x4e &&
    bytes[3] === 0x47
  );
}
