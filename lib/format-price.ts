export function formatPrice(
  value: { toString(): string } | number | string,
  fractionDigits = 2,
) {
  return Number(value).toLocaleString("en-MY", {
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  });
}

export function formatQuotePrice(
  value: { toString(): string } | number | string,
  currency = "USD",
) {
  return `${currency} ${formatPrice(value)}`;
}
