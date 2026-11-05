"use server";

import { comparePassword, setAdminSession, clearAdminSession, getAdminSession } from "@/lib/auth";
import { getAdminByEmail } from "@/lib/data";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export interface AuthActionResult {
  success: boolean;
  error?: string;
}

export async function loginAdminAction(
  prevState: AuthActionResult | null,
  formData: FormData
): Promise<AuthActionResult> {
  const email = formData.get("email")?.toString().trim();
  const password = formData.get("password")?.toString();

  if (!email || !password) {
    return { success: false, error: "Lütfen e-posta ve şifrenizi girin." };
  }

  // 1. ÖNCELİK: Varsayılan Yönetici Girişi (Veritabanı beklemeden ANINDA doğrula!)
  if (email.toLowerCase() === "admin@kafe.com" && password === "admin123") {
    await setAdminSession({
      userId: "admin-default",
      email: "admin@kafe.com",
      name: "Kafe Yöneticisi",
    });
    return { success: true };
  }

  // 2. ÖNCELİK: Veritabanı Yöneticisi (Varsa güvenli kontrol)
  try {
    const admin = await getAdminByEmail(email);
    if (admin && admin.passwordHash) {
      const isValid = await comparePassword(password, admin.passwordHash);
      if (isValid) {
        await setAdminSession({
          userId: admin.id,
          email: admin.email,
          name: admin.name || "Yönetici",
        });
        return { success: true };
      }
    }
  } catch {
    // Veritabanı hatası durumunda sessizce geç
  }

  return { success: false, error: "Hatalı e-posta veya şifre!" };
}

export async function logoutAdminAction() {
  await clearAdminSession();
  revalidatePath("/", "layout");
  redirect("/admin/login");
}

export async function getCurrentAdmin() {
  return await getAdminSession();
}
