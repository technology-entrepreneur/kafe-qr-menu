import { getAdminSession } from "@/lib/auth";
import { z } from "zod";

export interface ActionResult<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  fieldErrors?: Record<string, string[]>;
}

/**
 * Güvenli Admin Server Action Sarmalayıcısı
 * - Oturum doğrulaması (Auth check)
 * - Zod validasyonu ve sanitizasyon
 * - Güvenli hata yakalama (Error isolation)
 */
export async function runAdminAction<TInput, TOutput>(
  schema: z.ZodSchema<TInput>,
  rawData: unknown,
  handler: (validData: TInput, session: { email: string; name?: string | null }) => Promise<TOutput>
): Promise<ActionResult<TOutput>> {
  // 1. Yetki Kontrolü
  const session = await getAdminSession();
  if (!session) {
    return {
      success: false,
      error: "Yetkisiz işlem! Lütfen yönetici olarak giriş yapın.",
    };
  }

  // 2. Veri Doğrulama (Zod Validation)
  const validationResult = schema.safeParse(rawData);
  if (!validationResult.success) {
    const fieldErrors = validationResult.error.flatten().fieldErrors as Record<string, string[]>;
    const firstError =
      validationResult.error.issues?.[0]?.message || "Girdiğiniz veriler geçersiz.";

    return {
      success: false,
      error: firstError,
      fieldErrors,
    };
  }

  // 3. Eylemi Çalıştır
  try {
    const data = await handler(validationResult.data, session);
    return {
      success: true,
      data,
    };
  } catch (err: unknown) {
    console.error("Server Action Exception:", err);
    const message = err instanceof Error ? err.message : "İşlem sırasında beklenmeyen bir hata oluştu.";
    return {
      success: false,
      error: message,
    };
  }
}
