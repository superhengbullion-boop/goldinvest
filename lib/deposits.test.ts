import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { decideDeposit } from "@/lib/deposit-math";
import { normalizeDepositSettings } from "@/lib/deposit-settings";

const zero = { xauGrams: 0, fundMyr: 0 };

describe("decideDeposit", () => {
  it("adds gold once and leaves the fund balance unchanged", () => {
    const first = decideDeposit({
      status: "pending",
      kind: "xau",
      balances: { xauGrams: 1.5, fundMyr: 20 },
      decision: "approve",
      amount: 2.25,
    });
    assert.equal(first.ok, true);
    if (!first.ok) return;
    assert.equal(first.status, "approved");
    assert.equal(first.creditedAmount, 2.25);
    assert.equal(first.balances.xauGrams, 3.75);
    assert.equal(first.balances.fundMyr, 20);

    const again = decideDeposit({
      status: "approved",
      kind: "xau",
      balances: first.balances,
      decision: "approve",
      amount: 2.25,
    });
    assert.equal(again.ok, false);
  });

  it("adds fund money and rejects a second credit", () => {
    const first = decideDeposit({
      status: "pending",
      kind: "fund",
      balances: zero,
      decision: "approve",
      amount: 150.5,
    });
    assert.equal(first.ok, true);
    if (!first.ok) return;
    assert.equal(first.balances.fundMyr, 150.5);
    assert.equal(first.balances.xauGrams, 0);

    const again = decideDeposit({
      status: first.status,
      kind: "fund",
      balances: first.balances,
      decision: "approve",
      amount: 10,
    });
    assert.equal(again.ok, false);
  });

  it("rejects without changing either balance", () => {
    const result = decideDeposit({
      status: "pending",
      kind: "fund",
      balances: { xauGrams: 4, fundMyr: 8 },
      decision: "reject",
      amount: null,
    });
    assert.equal(result.ok, true);
    if (!result.ok) return;
    assert.equal(result.status, "rejected");
    assert.equal(result.creditedAmount, null);
    assert.equal(result.balances.xauGrams, 4);
    assert.equal(result.balances.fundMyr, 8);
  });

  it("requires a positive amount before approval", () => {
    const missing = decideDeposit({
      status: "pending",
      kind: "xau",
      balances: zero,
      decision: "approve",
      amount: null,
    });
    assert.equal(missing.ok, false);
    const zeroAmount = decideDeposit({
      status: "pending",
      kind: "fund",
      balances: zero,
      decision: "approve",
      amount: 0,
    });
    assert.equal(zeroAmount.ok, false);
  });
});

describe("normalizeDepositSettings", () => {
  it("falls back when the saved text is empty", () => {
    const settings = normalizeDepositSettings({
      infoHeading: "  ",
      supportPhone: "",
      fundInstructions: "\n",
      xauInstructions: [],
    });
    assert.equal(settings.infoHeading, "SuperHeng Gold Information");
    assert.equal(settings.supportPhone, "+6072870221");
    assert.equal(settings.accountHolderName, "SuperHeng Precious Metals Sdn Bhd");
    assert.equal(settings.fundInstructions.length, 4);
    assert.equal(settings.xauInstructions.length, 2);
  });
});
