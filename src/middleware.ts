import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";
import { getJwtSecret } from "@/lib/jwt-secret";

const PUBLIC_PATHS = [
  "/",
  "/about",
  "/programs",
  "/news",
  "/impact",
  "/opportunities",
  "/contact",
  "/api/public",
  "/api/uploads",
  "/api/auth/login",
];

const ADMIN_PATHS = ["/admin"];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isPublic = PUBLIC_PATHS.some(
    (p) => pathname === p || pathname.startsWith(p + "/")
  );
  const isAdmin = ADMIN_PATHS.some(
    (p) => pathname === p || pathname.startsWith(p + "/")
  );
  const isAdminApi =
    pathname.startsWith("/api/admin") || pathname.startsWith("/api/upload");

  if (pathname === "/admin/login") {
    return NextResponse.next();
  }

  if (isPublic && !isAdmin) {
    return NextResponse.next();
  }

  if (isAdmin || isAdminApi) {
    const token = request.cookies.get("yaf_token")?.value;

    if (!token) {
      if (isAdminApi) {
        return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
      }
      return NextResponse.redirect(new URL("/admin/login", request.url));
    }

    try {
      await jwtVerify(token, getJwtSecret());
      return NextResponse.next();
    } catch {
      if (isAdminApi) {
        return NextResponse.json({ error: "جلسة منتهية" }, { status: 401 });
      }
      const response = NextResponse.redirect(
        new URL("/admin/login", request.url)
      );
      response.cookies.delete("yaf_token");
      return response;
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*", "/api/upload/:path*"],
};
