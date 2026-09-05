export function formatMemberId(id: number) {
  return `SHB${String(id).padStart(7, "0")}`;
}
