import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

const KNOWN_SECRETS = [
  process.env.JWT_SECRET,
  "cafe-super-secret-qr-menu-admin-jwt-key-2026-production",
  "cafe-super-secret-qr-menu-admin-jwt-key-2026-fallback",
  "kafe-pro-qr-menu-admin-secret-2026-secure-key",
].filter(Boolean) as string[];

async function verifyAdminToken(token: string) {
  for (const secret of KNOWN_SECRETS) {
    try {
      const verified = await jwtVerify(token, new TextEncoder().encode(secret));
      if (verified && verified.payload) {
        return verified.payload;
      }
    } catch {
      // Bir sonraki anahtarı dene
    }
  }
  return null;
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Sadece /admin ile başlayan rotaları denetle
  if (pathname.startsWith("/admin")) {
    const token = request.cookies.get("cafe_admin_session")?.value;

    // Giriş sayfasına serbest erişim ver
    if (pathname === "/admin/login") {
      if (token) {
        const payload = await verifyAdminToken(token);
        if (payload) {
          // Zaten geçerli oturum varsa doğrudan dashboard'a yönlendir
          return NextResponse.redirect(new URL("/admin/dashboard", request.url));
        }
      }
      return NextResponse.next();
    }

    // Giriş yapılmamışsa login sayfasına yönlendir
    if (!token) {
      const loginUrl = new URL("/admin/login", request.url);
      loginUrl.searchParams.set("from", pathname);
      return NextResponse.redirect(loginUrl);
    }

    const payload = await verifyAdminToken(token);
    if (!payload) {
      // Token geçersiz veya süresi dolmuş
      const loginUrl = new URL("/admin/login", request.url);
      loginUrl.searchParams.set("from", pathname);
      const res = NextResponse.redirect(loginUrl);
      res.cookies.delete("cafe_admin_session");
      return res;
    }

    // /admin ana rotasına gelindiyse dashboard'a yönlendir
    if (pathname === "/admin") {
      return NextResponse.redirect(new URL("/admin/dashboard", request.url));
    }

    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
