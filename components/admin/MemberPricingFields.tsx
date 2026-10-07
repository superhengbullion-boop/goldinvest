"use client";

import { useMemo, useState } from "react";
import { formatPrice } from "@/lib/format-price";
import type { PricingBookOption } from "@/lib/member-pricing";
import {
  adjLookup,
  applyAdjustments,
  buildRatesBoard,
  mergeAdjustments,
  OFFSETTABLE_ROWS,
  type BoardRow,
  type ManualIdrMyr,
  type MemberAdjOverride,
} from "@/lib/metal-quotes";

export type { PricingBookOption };

export type PricingOverrideValue = {
  metal: string;
  unitKey: string;
  buyDelta: string;
  sellDelta: string;
};

type Props = {
  books: PricingBookOption[];
  marketBoard: BoardRow[];
  goldMarket: BoardRow[];
  silverMarket: BoardRow[];
  manualIdrMyr: ManualIdrMyr;
  initialBookId?: string;
  initialOverrides?: PricingOverrideValue[];
  /** When false, only active books are selectable (create form). */
  allowInactiveBooks?: boolean;
};

function overrideMap(values: PricingOverrideValue[]) {
  return new Map(values.map((item) => [`${item.metal}:${item.unitKey}`, item]));
}

function emptyOverrides(): PricingOverrideValue[] {
  return OFFSETTABLE_ROWS.map((row) => ({
    metal: row.metal,
    unitKey: row.unitKey,
    buyDelta: "",
    sellDelta: "",
  }));
}

export function MemberPricingFields({
  books,
  marketBoard,
  goldMarket,
  silverMarket,
  manualIdrMyr,
  initialBookId = "",
  initialOverrides,
  allowInactiveBooks = false,
}: Props) {
  const [bookId, setBookId] = useState(initialBookId);
  const [overrides, setOverrides] = useState<PricingOverrideValue[]>(() => {
    const base = emptyOverrides();
    if (!initialOverrides?.length) return base;
    const byKey = overrideMap(initialOverrides);
    return base.map((row) => {
      const match = byKey.get(`${row.metal}:${row.unitKey}`);
      return match
        ? {
            ...row,
            buyDelta: match.buyDelta,
            sellDelta: match.sellDelta,
          }
        : row;
    });
  });

  const selectableBooks = allowInactiveBooks
    ? books
    : books.filter((book) => book.isActive);

  const preview = useMemo(() => {
    // Preview uses the selected book's offsets (even if inactive) so admins can see the result.
    const selectedAdjs = books.find((item) => item.id === bookId)?.adjustments ?? [];
    const memberOverrides: MemberAdjOverride[] = overrides.map((item) => ({
      metal: item.metal,
      unitKey: item.unitKey,
      buyDelta: item.buyDelta.trim() === "" ? null : Number(item.buyDelta),
      sellDelta: item.sellDelta.trim() === "" ? null : Number(item.sellDelta),
    }));
    const merged = mergeAdjustments(selectedAdjs, memberOverrides);
    const goldAdjusted = applyAdjustments(goldMarket, "XAU", merged);
    const silverAdjusted = applyAdjustments(silverMarket, "XAG", merged);
    const idrMyrAdj = adjLookup(merged, "XAU", "idr-myr");
    return buildRatesBoard(goldAdjusted, silverAdjusted, manualIdrMyr, idrMyrAdj);
  }, [bookId, books, goldMarket, manualIdrMyr, overrides, silverMarket]);

  function setOverride(
    metal: string,
    unitKey: string,
    side: "buyDelta" | "sellDelta",
    value: string,
  ) {
    setOverrides((current) =>
      current.map((row) =>
        row.metal === metal && row.unitKey === unitKey
          ? { ...row, [side]: value }
          : row,
      ),
    );
  }

  return (
    <div className="col-span-full space-y-4 rounded-lg border border-gold/20 p-4">
      <div>
        <p className="font-display text-lg text-ivory">Pricing</p>
        <p className="mt-1 text-sm text-mist">
          Choose a base price book, then optionally override individual rows.
          Leave an override blank to inherit the book (or market if no book).
        </p>
      </div>

      <label className="block max-w-md text-sm">
        <span className="mb-1 block text-mist">Base price book</span>
        <select
          name="rateBookId"
          value={bookId}
          onChange={(event) => setBookId(event.target.value)}
          className="w-full rounded border border-gold/30 bg-ink px-3 py-2"
        >
          <option value="">No price book</option>
          {selectableBooks.map((book) => (
            <option key={book.id} value={book.id}>
              {book.name}
              {book.isActive ? "" : " (disabled)"}
            </option>
          ))}
        </select>
      </label>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[40rem] text-left text-sm">
          <thead className="text-xs uppercase tracking-[0.14em] text-gold">
            <tr>
              <th className="py-2 pr-3">Row</th>
              <th className="py-2 pr-3">Market</th>
              <th className="py-2 pr-3">Buy override</th>
              <th className="py-2 pr-3">Sell override</th>
              <th className="py-2">Member sees</th>
            </tr>
          </thead>
          <tbody>
            {OFFSETTABLE_ROWS.map((row) => {
              const current = overrides.find(
                (item) => item.metal === row.metal && item.unitKey === row.unitKey,
              );
              const marketRow = marketBoard.find((item) => item.key === row.boardKey);
              const previewRow = preview.find((item) => item.key === row.boardKey);
              const digits = marketRow?.digits ?? row.digits;
              return (
                <tr key={row.boardKey} className="border-t border-gold/15">
                  <td className="py-2 pr-3">{row.label}</td>
                  <td className="py-2 pr-3 text-mist">
                    {marketRow
                      ? `${formatPrice(marketRow.buy, digits)} / ${formatPrice(marketRow.sell, digits)}`
                      : "—"}
                  </td>
                  <td className="py-2 pr-3">
                    <input
                      name={`ovr_${row.metal}_${row.unitKey}_buy`}
                      type="number"
                      step="any"
                      placeholder="Inherit"
                      value={current?.buyDelta ?? ""}
                      onChange={(event) =>
                        setOverride(row.metal, row.unitKey, "buyDelta", event.target.value)
                      }
                      className="w-28 rounded border border-gold/30 bg-ink px-2 py-1"
                    />
                  </td>
                  <td className="py-2 pr-3">
                    <input
                      name={`ovr_${row.metal}_${row.unitKey}_sell`}
                      type="number"
                      step="any"
                      placeholder="Inherit"
                      value={current?.sellDelta ?? ""}
                      onChange={(event) =>
                        setOverride(row.metal, row.unitKey, "sellDelta", event.target.value)
                      }
                      className="w-28 rounded border border-gold/30 bg-ink px-2 py-1"
                    />
                  </td>
                  <td className="py-2 text-gold">
                    {previewRow
                      ? `${formatPrice(previewRow.buy, digits)} / ${formatPrice(previewRow.sell, digits)}`
                      : "—"}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
