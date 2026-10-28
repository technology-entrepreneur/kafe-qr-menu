import { getCategoriesWithProducts, getBusinessSettings, getCampaigns } from "@/lib/data";
import MenuClientView from "@/components/menu/MenuClientView";

export const revalidate = 0;

interface MenuPageProps {
  searchParams?: {
    table?: string;
  };
}

export async function generateMetadata() {
  const settings = await getBusinessSettings();
  return {
    title: `${settings.cafeName} | Satış & Dönüşüm Odaklı Dijital QR Menü`,
    description: `${settings.cafeName} güncel kahve, tatlı, kahvaltı ve fırsat menüsü.`,
  };
}

export default async function MenuPage({ searchParams }: MenuPageProps) {
  const [categories, campaigns, settings] = await Promise.all([
    getCategoriesWithProducts(true),
    getCampaigns(true), // Sadece aktif kampanyalar
    getBusinessSettings(),
  ]);

  const tableNumber = searchParams?.table || null;

  return (
    <MenuClientView
      categories={categories}
      campaigns={campaigns}
      settings={settings}
      tableNumber={tableNumber}
    />
  );
}
