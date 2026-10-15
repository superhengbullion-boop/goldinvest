import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { assetsHubEnabled, isAssetsHubPath } from "@/lib/feature-flags";

export function proxy(request: NextRequest) {
  if (assetsHubEnabled() || !isAssetsHubPath(request.nextUrl.pathname)) {
    return NextResponse.next();
  }
  return new NextResponse(null, { status: 404 });
}

export const config = {
  matcher: [
    "/admin/deposits",
    "/admin/deposits/:path*",
    "/admin/withdrawals",
    "/admin/withdrawals/:path*",
    "/admin/transfers",
    "/admin/transfers/:path*",
    "/admin/bank-accounts",
    "/admin/bank-accounts/:path*",
    "/admin/announcements",
    "/admin/announcements/:path*",
    "/admin/deposit-info",
    "/admin/deposit-info/:path*",
    "/api/mobile/announcements",
    "/api/mobile/announcements/:path*",
    "/api/mobile/assets",
    "/api/mobile/assets/:path*",
    "/api/mobile/bank-accounts",
    "/api/mobile/bank-accounts/:path*",
    "/api/mobile/deposit-info",
    "/api/mobile/deposit-info/:path*",
    "/api/mobile/deposits",
    "/api/mobile/deposits/:path*",
    "/api/mobile/password",
    "/api/mobile/password/:path*",
    "/api/mobile/prices",
    "/api/mobile/prices/:path*",
    "/api/mobile/transfers",
    "/api/mobile/transfers/:path*",
    "/api/mobile/wallet",
    "/api/mobile/wallet/:path*",
    "/api/mobile/withdrawals",
    "/api/mobile/withdrawals/:path*",
  ],
};
