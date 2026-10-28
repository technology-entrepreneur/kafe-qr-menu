import { getCategoriesWithProducts, getBusinessSettings, getCampaigns } from "@/lib/data";
import { getAdminSession } from "@/lib/auth";
import AdminDashboardView from "@/components/admin/AdminDashboardView";
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

  const [categories, campaigns, settings] = await Promise.all([
    getCategoriesWithProducts(false), // Admin tüm kategorileri görür
    getCampaigns(false), // Admin tüm kampanyaları görür
    getBusinessSettings(),
  ]);

  return (
    <AdminDashboardView
      categories={categories}
      campaigns={campaigns}
      settings={settings}
      adminName={session.name || "Yönetici"}
    />
  );
}
