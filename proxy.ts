import { NextResponse, type NextRequest } from "next/server";
import { decrypt, decryptMember } from "@/lib/session-token";

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isAdmin = pathname.startsWith("/admin");
  const isAdminLogin = pathname === "/admin/login";
  const isMemberLogin = pathname === "/login";
  const needsMember = pathname === "/rates" || pathname.startsWith("/portal");

  if (isAdmin) {
    const session = await decrypt(request.cookies.get("session")?.value);
    if (!session && !isAdminLogin) {
      return NextResponse.redirect(new URL("/admin/login", request.url));
    }
    if (session && isAdminLogin) {
      return NextResponse.redirect(new URL("/admin", request.url));
    }
    return NextResponse.next();
  }

  const member = await decryptMember(request.cookies.get("member_session")?.value);

  if (needsMember && !member) {
    const login = new URL("/login", request.url);
    login.searchParams.set("next", pathname);
    return NextResponse.redirect(login);
  }

  if (isMemberLogin && member) {
    return NextResponse.redirect(new URL("/portal", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/rates", "/login", "/portal", "/portal/:path*"],
};
