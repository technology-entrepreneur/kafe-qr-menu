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

  const admin = await getAdminByEmail(email);

  // Eğer admin bulunamadıysa varsayılan geliştirme admin kontrolü
  let isValid = false;
  let adminId = "";
  let adminName = "Kafe Yöneticisi";

  // Varsayılan demo yönetici doğrudan doğrulaması
  if (email.toLowerCase() === "admin@kafe.com" && password === "admin123") {
    isValid = true;
    adminId = admin?.id || "admin-default";
    adminName = admin?.name || "Kafe Yöneticisi";
  } else if (admin) {
    isValid = await comparePassword(password, admin.passwordHash);
    adminId = admin.id;
    adminName = admin.name || "Yönetici";
  }

  if (!isValid) {
    return { success: false, error: "Hatalı e-posta veya şifre!" };
  }

  await setAdminSession({
    userId: adminId,
    email,
    name: adminName,
  });

  return { success: true };
}

export async function logoutAdminAction() {
  await clearAdminSession();
  revalidatePath("/", "layout");
  redirect("/admin/login");
}

export async function getCurrentAdmin() {
  return await getAdminSession();
}
