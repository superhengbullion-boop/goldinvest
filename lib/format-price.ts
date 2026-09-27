export function formatPrice(
  value: { toString(): string } | number | string,
  fractionDigits = 2,
) {
  const amount = Number(value);
  if (!Number.isFinite(amount) || amount === 0) return "N/A";
  return amount.toLocaleString("en-MY", {
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  });
}

export function formatQuotePrice(
  value: { toString(): string } | number | string,
  currency = "USD",
) {
  const formatted = formatPrice(value);
  if (formatted === "N/A") return "N/A";
  return `${currency} ${formatted}`;
}
