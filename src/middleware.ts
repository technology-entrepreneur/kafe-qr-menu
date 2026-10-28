import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "cafe-super-secret-qr-menu-admin-jwt-key-2026-fallback"
);

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Sadece /admin ile başlayan rotaları denetle
  if (pathname.startsWith("/admin")) {
    // Giriş sayfasına serbest erişim ver
    if (pathname === "/admin/login") {
      const token = request.cookies.get("cafe_admin_session")?.value;
      if (token) {
        try {
          await jwtVerify(token, JWT_SECRET);
          // Zaten giriş yapmışsa paneline yönlendir
          return NextResponse.redirect(new URL("/admin/dashboard", request.url));
        } catch {
          // Geçersiz token, girişte kalabilir
        }
      }
      return NextResponse.next();
    }

    // /admin ana rotasına gelindiyse dashboard'a yönlendir (oturum varsa) veya login'e
    const token = request.cookies.get("cafe_admin_session")?.value;

    if (!token) {
      const loginUrl = new URL("/admin/login", request.url);
      loginUrl.searchParams.set("from", pathname);
      return NextResponse.redirect(loginUrl);
    }

    try {
      await jwtVerify(token, JWT_SECRET);
      if (pathname === "/admin") {
        return NextResponse.redirect(new URL("/admin/dashboard", request.url));
      }
      return NextResponse.next();
    } catch (err) {
      // Token geçersiz veya süresi dolmuş
      const loginUrl = new URL("/admin/login", request.url);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
