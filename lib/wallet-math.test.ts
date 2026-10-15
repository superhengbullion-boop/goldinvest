import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { filterWalletRows, tradingLimitError, transferEffect, withdrawalEffect, withdrawalHold, type WalletRow } from "@/lib/wallet-math";

const rows: WalletRow[] = [
  { id: "d1", asset: "xau", method: "deposit", status: "approved", amount: 2, createdAt: "2026-10-01T00:00:00.000Z" },
  { id: "d2", asset: "fund", method: "deposit", status: "declined", amount: null, createdAt: "2026-10-02T00:00:00.000Z" },
  { id: "w1", asset: "xau", method: "withdrawal", status: "pending", amount: 1, createdAt: "2026-10-03T00:00:00.000Z" },
];

describe("filterWalletRows", () => {
  it("keeps an approved gold deposit", () => {
    const matched = filterWalletRows(rows, { method: "deposit", status: "approved" });
    assert.deepEqual(matched.map((row) => row.id), ["d1"]);
  });

  it("omits a row before the start date", () => {
    const matched = filterWalletRows(rows, { from: "2026-10-03" });
    assert.deepEqual(matched.map((row) => row.id), ["w1"]);
  });
});

describe("withdrawalHold", () => {
  it("deducts gold and fund as soon as the request is submitted", () => {
    const gold = withdrawalHold({ kind: "xau", amount: 1.5, balance: 3 });
    assert.equal(gold.ok && gold.balance, 1.5);
    const fund = withdrawalHold({ kind: "fund", amount: 20, balance: 100 });
    assert.equal(fund.ok && fund.balance, 80);
    const over = withdrawalHold({ kind: "fund", amount: 5, balance: 4 });
    assert.equal(over.ok, false);
  });
});

describe("withdrawalEffect", () => {
  it("keeps an approved hold and credits the amount back when rejected", () => {
    const approved = withdrawalEffect({ status: "pending", kind: "xau", amount: 1, balance: 1, decision: "approve" });
    assert.equal(approved.ok && approved.status, "approved");
    assert.equal(approved.ok && approved.balance, 1);
    const again = withdrawalEffect({ status: "approved", kind: "xau", amount: 1, balance: 1, decision: "approve" });
    assert.equal(again.ok, false);
    const rejected = withdrawalEffect({ status: "pending", kind: "fund", amount: 5, balance: 3, decision: "reject" });
    assert.equal(rejected.ok && rejected.status, "rejected");
    assert.equal(rejected.ok && rejected.balance, 8);
  });
});

describe("transferEffect", () => {
  it("moves grams once", () => {
    const moved = transferEffect({ status: "pending", grams: 1, sender: 2, recipient: 0, decision: "approve" });
    assert.equal(moved.ok && moved.sender, 1);
    assert.equal(moved.ok && moved.recipient, 1);
    const rejected = transferEffect({ status: "pending", grams: 1, sender: 2, recipient: 0, decision: "reject" });
    assert.equal(rejected.ok && rejected.sender, 2);
  });
});

describe("tradingLimitError", () => {
  it("rejects a negative limit", () => {
    assert.equal(tradingLimitError("-1"), "Trading limit must be 0 or more.");
    assert.equal(tradingLimitError(""), null);
    assert.equal(tradingLimitError("1500"), null);
  });
});
