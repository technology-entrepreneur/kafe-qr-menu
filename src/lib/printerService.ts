// Termal Yazdırma Servisi & İstemci Yardımcısı
import { ThermalPrintData } from "@/components/print/ThermalReceipt";

export async function triggerThermalPrint(
  data: ThermalPrintData,
  onPrintStateChange?: (data: ThermalPrintData | null) => void
) {
  // 1. DOM Üzerindeki gizli #thermal-print-container bileşenini güncelle
  if (onPrintStateChange) {
    onPrintStateChange(data);
  }

  // 2. Tarayıcı üzerinden termal yazdırmayı tetikle
  // (Chrome --kiosk-printing modunda kullanıcıya sormadan direkt donanıma basar)
  setTimeout(() => {
    try {
      window.print();
    } catch (err) {
      console.error("Yazdırma hatası:", err);
    }
  }, 100);

  // 3. Eşzamanlı olarak yerel ağdaki (LAN TCP/IP 9100) ESC/POS köprüsüne (Print Bridge) gönder
  try {
    await fetch("/api/print-queue", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        receipt: data,
        station: data.type === "kitchen" ? data.kdsStation : "cashier",
        createdAt: new Date().toISOString(),
      }),
    });
  } catch {
    // Köprü aktif değilse tarayıcı yazdırması zaten tamamlanmıştır
  }
}

