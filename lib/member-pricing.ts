import type { RateBookRow } from "@/lib/data";
import type { RateAdj } from "@/lib/metal-quotes";

export type PricingBookOption = {
  id: string;
  name: string;
  isActive: boolean;
  adjustments: RateAdj[];
};

export function toPricingBooks(books: RateBookRow[]): PricingBookOption[] {
  return books.map((book) => ({
    id: book.id,
    name: book.name,
    isActive: book.isActive,
    adjustments: book.adjustments.map((item) => ({
      metal: item.metal,
      unitKey: item.unitKey,
      buyDelta: Number(item.buyDelta),
      sellDelta: Number(item.sellDelta),
    })),
  }));
}
