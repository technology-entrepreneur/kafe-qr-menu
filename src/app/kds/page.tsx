import { getBusinessSettings } from "@/lib/data";
import KdsBoard from "@/components/kds/KdsBoard";

export const revalidate = 0;

export const metadata = {
  title: "Mutfak & Bar KDS Ekranı | Canlı Sipariş Yönetimi",
  description: "Mutfak ve Bar için gerçek zamanlı KDS ekranı. SLA takibi ve istasyon ayrımı.",
};

export default async function KdsPage() {
  const settings = await getBusinessSettings();

  return <KdsBoard cafeName={settings.cafeName} />;
}

