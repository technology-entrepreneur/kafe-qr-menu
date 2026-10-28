import { getBusinessSettings } from "@/lib/data";
import { getMergedCafeConfig } from "@/config/cafe";
import WelcomeHub from "@/components/welcome/WelcomeHub";

export const revalidate = 0;

interface WelcomePageProps {
  searchParams?: {
    table?: string;
  };
}

export async function generateMetadata() {
  const settings = await getBusinessSettings();
  return {
    title: `Hoş Geldiniz | ${settings.cafeName}`,
    description: `${settings.cafeName} dijital karşılama merkezi, temassız QR menü ve değerlendirme platformu.`,
    openGraph: {
      title: `${settings.cafeName} • Hoş Geldiniz`,
      description: "Kahvenizi yudumlarken anın tadını çıkarın. Güncel menümüzü inceleyin.",
    },
  };
}

export default async function WelcomePage({ searchParams }: WelcomePageProps) {
  const settings = await getBusinessSettings();
  const table = searchParams?.table || null;
  const config = getMergedCafeConfig(settings, table);

  return <WelcomeHub config={config} tableNumber={table} />;
}
