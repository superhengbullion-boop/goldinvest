/** Unreleased assets hub: deposits, wallet, transfers, announcements, prices. */
const ASSETS_HUB_PREFIXES = [
  "/admin/deposits",
  "/admin/withdrawals",
  "/admin/transfers",
  "/admin/bank-accounts",
  "/admin/announcements",
  "/admin/deposit-info",
  "/api/mobile/announcements",
  "/api/mobile/assets",
  "/api/mobile/bank-accounts",
  "/api/mobile/deposit-info",
  "/api/mobile/deposits",
  "/api/mobile/password",
  "/api/mobile/prices",
  "/api/mobile/transfers",
  "/api/mobile/wallet",
  "/api/mobile/withdrawals",
];

export function assetsHubEnabled() {
  const value = process.env.ASSETS_HUB_ENABLED?.trim().toLowerCase();
  return value === "1" || value === "true" || value === "yes";
}

export function isAssetsHubPath(pathname: string) {
  return ASSETS_HUB_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
}

export function assetsHubNotFound() {
  if (assetsHubEnabled()) return null;
  return Response.json({ error: "Not found." }, { status: 404 });
}
