import { z } from "zod";

/**
 * XSS & Script Enjeksiyonu Temizleme Yardımcısı
 */
export function sanitizeText(text: string | null | undefined): string | null {
  if (!text) return null;
  return text
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
    .replace(/<[^>]+>/g, "")
    .replace(/javascript:/gi, "")
    .replace(/data:text\/html/gi, "")
    .trim();
}

/**
 * Güvenli URL Doğrulayıcısı (Sadece http / https veya yerel / path kabul eder)
 */
const safeUrlSchema = z
  .string()
  .trim()
  .refine(
    (url) => !url || /^https?:\/\//i.test(url) || url.startsWith("/"),
    { message: "URL sadece http://, https:// veya / ile başlayabilir." }
  )
  .nullable()
  .optional();

// ==========================================
// 1. ÜRÜN ŞEMASI (Product Validation)
// ==========================================
export const ProductSchema = z.object({
  id: z.string().optional(),
  name: z
    .string()
    .trim()
    .min(2, { message: "Ürün adı en az 2 karakter olmalıdır." })
    .max(120, { message: "Ürün adı en fazla 120 karakter olabilir." })
    .transform((val) => sanitizeText(val) || val),
  nameEn: z
    .string()
    .trim()
    .max(120)
    .optional()
    .nullable()
    .transform(sanitizeText),
  description: z
    .string()
    .trim()
    .max(500, { message: "Açıklama en fazla 500 karakter olabilir." })
    .optional()
    .nullable()
    .transform(sanitizeText),
  descriptionEn: z
    .string()
    .trim()
    .max(500)
    .optional()
    .nullable()
    .transform(sanitizeText),
  price: z
    .number()
    .min(0, { message: "Fiyat 0 veya daha büyük olmalıdır." })
    .max(100000, { message: "Fiyat gerçekçi bir sınırda olmalıdır." }),
  imageUrl: safeUrlSchema,
  categoryId: z.string().min(1, { message: "Kategori seçimi zorunludur." }),
  allergens: z
    .string()
    .trim()
    .max(200)
    .optional()
    .nullable()
    .transform(sanitizeText),
  allergensEn: z
    .string()
    .trim()
    .max(200)
    .optional()
    .nullable()
    .transform(sanitizeText),
  calories: z.number().int().min(0).max(5000).optional().nullable(),
  prepTimeMinutes: z.number().int().min(0).max(180).optional().nullable(),
  badge: z
    .enum(["chef", "popular", "deal", "new"])
    .optional()
    .nullable()
    .or(z.string().max(30).optional().nullable()),
  order: z.number().int().default(0),
  isAvailable: z.boolean().default(true),
});

export type ProductInput = z.infer<typeof ProductSchema>;

// ==========================================
// 2. KATEGORİ ŞEMASI (Category Validation)
// ==========================================
export const CategorySchema = z.object({
  id: z.string().optional(),
  name: z
    .string()
    .trim()
    .min(2, { message: "Kategori adı en az 2 karakter olmalıdır." })
    .max(80, { message: "Kategori adı en fazla 80 karakter olabilir." })
    .transform((val) => sanitizeText(val) || val),
  nameEn: z
    .string()
    .trim()
    .max(80)
    .optional()
    .nullable()
    .transform(sanitizeText),
  icon: z.string().trim().max(10).optional().nullable(),
  order: z.number().int().default(0),
  isActive: z.boolean().default(true),
});

export type CategoryInput = z.infer<typeof CategorySchema>;

// ==========================================
// 3. KAMPANYA ŞEMASI (Campaign Validation)
// ==========================================
export const CampaignSchema = z.object({
  id: z.string().optional(),
  title: z
    .string()
    .trim()
    .min(2, { message: "Kampanya başlığı en az 2 karakter olmalıdır." })
    .max(120)
    .transform((val) => sanitizeText(val) || val),
  subtitle: z
    .string()
    .trim()
    .max(200)
    .optional()
    .nullable()
    .transform(sanitizeText),
  badgeText: z
    .string()
    .trim()
    .max(40)
    .optional()
    .nullable()
    .transform(sanitizeText),
  imageUrl: safeUrlSchema,
  originalPrice: z.number().min(0).optional().nullable(),
  discountedPrice: z.number().min(0).optional().nullable(),
  isActive: z.boolean().default(true),
  order: z.number().int().default(0),
});

export type CampaignInput = z.infer<typeof CampaignSchema>;

// ==========================================
// 4. İŞLETME AYARLARI ŞEMASI (Settings Validation)
// ==========================================
export const BusinessSettingsSchema = z.object({
  cafeName: z
    .string()
    .trim()
    .min(2, { message: "Kafe adı en az 2 karakter olmalıdır." })
    .max(100)
    .transform((val) => sanitizeText(val) || val),
  logoUrl: safeUrlSchema,
  wifiSsid: z
    .string()
    .trim()
    .max(50)
    .optional()
    .nullable()
    .transform(sanitizeText),
  wifiPassword: z
    .string()
    .trim()
    .max(50)
    .optional()
    .nullable()
    .transform(sanitizeText),
  workingHours: z
    .string()
    .trim()
    .max(100)
    .optional()
    .nullable()
    .transform(sanitizeText),
  phone: z
    .string()
    .trim()
    .max(30)
    .optional()
    .nullable()
    .transform(sanitizeText),
  address: z
    .string()
    .trim()
    .max(250)
    .optional()
    .nullable()
    .transform(sanitizeText),
  instagramUrl: safeUrlSchema,
  tiktokUrl: safeUrlSchema,
  googleReviewUrl: safeUrlSchema,
  whatsappNumber: z
    .string()
    .trim()
    .regex(/^[0-9+]*$/, { message: "Geçerli bir telefon numarası giriniz." })
    .max(20)
    .optional()
    .nullable(),
});

export type BusinessSettingsInput = z.infer<typeof BusinessSettingsSchema>;

// ==========================================
// 5. SERVİS VE HESAP ÇAĞRI ŞEMASI (Service Call)
// ==========================================
export const ServiceCallSchema = z.object({
  tableNumber: z
    .string()
    .trim()
    .max(20)
    .optional()
    .nullable()
    .transform(sanitizeText),
  callType: z.enum(["waiter", "bill_cash", "bill_card", "bill_meal"]),
  notes: z
    .string()
    .trim()
    .max(200)
    .optional()
    .nullable()
    .transform(sanitizeText),
});

export type ServiceCallInput = z.infer<typeof ServiceCallSchema>;
