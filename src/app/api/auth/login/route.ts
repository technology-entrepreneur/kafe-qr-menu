import { NextResponse } from "next/server";
import { signSessionToken, comparePassword } from "@/lib/auth";
import { getAdminByEmail } from "@/lib/data";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const email = body.email?.toString().trim();
    const password = body.password?.toString();

    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: "Lütfen e-posta ve şifrenizi girin." },
        { status: 400 }
      );
    }

    let isValid = false;
    let adminId = "admin-default";
    let adminName = "Kafe Yöneticisi";

    // 1. Varsayılan Demo Girişi (Veritabanı beklemeden ANINDA doğrula!)
    if (email.toLowerCase() === "admin@kafe.com" && password === "admin123") {
      isValid = true;
    } else {
      // 2. Veritabanı Yöneticisi Kontrolü
      try {
        const admin = await getAdminByEmail(email);
        if (admin && admin.passwordHash) {
          const match = await comparePassword(password, admin.passwordHash);
          if (match) {
            isValid = true;
            adminId = admin.id;
            adminName = admin.name || "Yönetici";
          }
        }
      } catch {}
    }

    if (!isValid) {
      return NextResponse.json(
        { success: false, error: "Hatalı e-posta veya şifre!" },
        { status: 401 }
      );
    }

    // JWT Token Üret
    const token = await signSessionToken({
      userId: adminId,
      email,
      name: adminName,
    });

    const response = NextResponse.json({
      success: true,
      user: { id: adminId, email, name: adminName },
    });

    // Çerezi doğrudan HTTP Response başlığına yaz
    response.cookies.set("cafe_admin_session", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7, // 7 gün
    });

    return response;
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: "Sunucu hatası oluştu." },
      { status: 500 }
    );
  }
}
