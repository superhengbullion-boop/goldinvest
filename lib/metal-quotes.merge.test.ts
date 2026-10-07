import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  hasMemberOverrides,
  mergeAdjustments,
  type RateAdj,
} from "@/lib/metal-quotes";

const book: RateAdj[] = [
  { metal: "XAU", unitKey: "myr-kg", buyDelta: 10, sellDelta: 20 },
  { metal: "XAG", unitKey: "myr-kg", buyDelta: 1, sellDelta: 2 },
];

describe("mergeAdjustments", () => {
  it("uses book deltas when no overrides", () => {
    const merged = mergeAdjustments(book, []);
    const gold = merged.find((row) => row.metal === "XAU" && row.unitKey === "myr-kg");
    assert.equal(gold?.buyDelta, 10);
    assert.equal(gold?.sellDelta, 20);
  });

  it("overrides only the provided side", () => {
    const merged = mergeAdjustments(book, [
      { metal: "XAU", unitKey: "myr-kg", buyDelta: 50, sellDelta: null },
    ]);
    const gold = merged.find((row) => row.metal === "XAU" && row.unitKey === "myr-kg");
    assert.equal(gold?.buyDelta, 50);
    assert.equal(gold?.sellDelta, 20);
  });

  it("applies overrides without a book", () => {
    const merged = mergeAdjustments([], [
      { metal: "XAU", unitKey: "myr-kg", buyDelta: 7, sellDelta: 8 },
    ]);
    const gold = merged.find((row) => row.metal === "XAU" && row.unitKey === "myr-kg");
    assert.equal(gold?.buyDelta, 7);
    assert.equal(gold?.sellDelta, 8);
  });
});

describe("hasMemberOverrides", () => {
  it("is false when every field is blank/null", () => {
    assert.equal(
      hasMemberOverrides([{ metal: "XAU", unitKey: "myr-kg", buyDelta: null, sellDelta: "" }]),
      false,
    );
  });

  it("is true when any side is set", () => {
    assert.equal(
      hasMemberOverrides([{ metal: "XAU", unitKey: "myr-kg", buyDelta: 1, sellDelta: null }]),
      true,
    );
  });
});
