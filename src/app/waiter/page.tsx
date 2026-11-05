import { getBusinessSettings, getCategoriesWithProducts } from "@/lib/data";
import WaiterDashboard from "@/components/waiter/WaiterDashboard";

export const revalidate = 0;

export const metadata = {
  title: "Garson Terminali | Canlı Masa & Çağrı Yönetimi",
  description: "Garson el terminali, masa siparişleri ve çağrı takip ekranı.",
};

export default async function WaiterPage() {
  const [settings, categories] = await Promise.all([
    getBusinessSettings(),
    getCategoriesWithProducts(false),
  ]);

  return (
    <WaiterDashboard
      cafeName={settings.cafeName}
      categories={categories}
    />
  );
}

