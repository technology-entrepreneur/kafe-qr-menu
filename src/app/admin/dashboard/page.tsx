import {
  getCategoriesWithProducts,
  getBusinessSettings,
  getCampaigns,
  initialCategories,
  initialCampaigns,
} from "@/lib/data";
import { getAdminSession } from "@/lib/auth";
import AdminDashboardView from "@/components/admin/AdminDashboardView";
import { CategoryItem, CampaignItem, BusinessSettingsData } from "@/lib/types";
import { redirect } from "next/navigation";

export const revalidate = 0;

export const metadata = {
  title: "Admin Dashboard | QR Menü & Satış Yönetimi",
  description: "Kafe menüsü, ürünleri, fırsatları ve çapraz satış ayarlarını yönetin.",
};

export default async function AdminDashboardPage() {
  const session = await getAdminSession();
  if (!session) {
    redirect("/admin/login");
  }

  let categories: CategoryItem[] = [];
  let campaigns: CampaignItem[] = [];
  let settings: BusinessSettingsData | null = null;

  try {
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error("DB Timeout")), 1200)
    );
    const dbPromise = Promise.all([
      getCategoriesWithProducts(false), // Admin tüm kategorileri görür
      getCampaigns(false), // Admin tüm kampanyaları görür
      getBusinessSettings(),
    ]);

    const results = (await Promise.race([dbPromise, timeoutPromise])) as any;
    categories = results[0] || [];
    campaigns = results[1] || [];
    settings = results[2];
  } catch {
    // Veritabanı gecikirse veya hata verirse anında fallback verileri kullan
  }

  if (!categories || categories.length === 0) {
    categories = initialCategories;
  }

  if (!campaigns || campaigns.length === 0) {
    campaigns = initialCampaigns;
  }

  return (
    <AdminDashboardView
      categories={categories}
      campaigns={campaigns}
      settings={settings || {
        id: "default",
        cafeName: "Kafe & Lounge",
        businessType: "cafe",
        isCatalogOnly: false,
        hookahMode: false,
        enableWaiterCall: true,
        enableBillRequest: true,
        enableQuickWifiBar: true,
        enableGoogleReviewPrompt: true,
        hookahCoalTimerMinutes: 25,
        hookahCoalCooldownMinutes: 10,
        kdsSlaDurationMinutes: 10,
        updatedAt: new Date(),
      } as any}
      adminName={session.name || "Yönetici"}
    />
  );
}
