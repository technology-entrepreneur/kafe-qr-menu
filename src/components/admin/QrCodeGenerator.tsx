"use client";

import { useState, useEffect, useRef } from "react";
import QRCode from "qrcode";
import { Download, QrCode, Printer, Check, Copy, Sparkles, Compass } from "lucide-react";

interface QrCodeGeneratorProps {
  cafeName: string;
}

export default function QrCodeGenerator({ cafeName }: QrCodeGeneratorProps) {
  const [destinationType, setDestinationType] = useState<"hub" | "menu">("hub");
  const [origin, setOrigin] = useState("http://localhost:3000");
  const [customPath, setCustomPath] = useState("");
  const [tableNumber, setTableNumber] = useState<string>("");
  const [qrDataUrl, setQrDataUrl] = useState<string>("");
  const [qrSvg, setQrSvg] = useState<string>("");
  const [copied, setCopied] = useState(false);
  const printRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setOrigin(window.location.origin);
    }
  }, []);

  // Belirlenen hedef rotaya göre URL inşası
  const getComputedUrl = () => {
    let base = origin;
    if (destinationType === "hub") {
      base = `${origin}/`;
    } else if (destinationType === "menu") {
      base = `${origin}/menu`;
    }

    if (customPath) {
      base = customPath;
    }

    const trimmedTable = tableNumber.trim();
    if (!trimmedTable) return base;

    const separator = base.includes("?") ? "&" : "?";
    return `${base}${separator}table=${encodeURIComponent(trimmedTable)}`;
  };

  const fullUrl = getComputedUrl();

  useEffect(() => {
    // PNG Data URL Üretimi
    QRCode.toDataURL(fullUrl, {
      width: 1000,
      margin: 2,
      color: {
        dark: "#1c1917",
        light: "#ffffff",
      },
    }).then(setQrDataUrl);

    // SVG Metni Üretimi
    QRCode.toString(fullUrl, {
      type: "svg",
      margin: 2,
      color: {
        dark: "#1c1917",
        light: "#ffffff",
      },
    }).then(setQrSvg);
  }, [fullUrl]);

  // PNG İndirme
  const downloadPNG = () => {
    const a = document.createElement("a");
    a.href = qrDataUrl;
    const targetLabel = destinationType === "hub" ? "Hub" : "Menu";
    a.download = `${cafeName.replace(/\s+/g, "_")}_QR_${targetLabel}${tableNumber ? `_Masa_${tableNumber}` : ""}.png`;
    a.click();
  };

  // SVG İndirme
  const downloadSVG = () => {
    const blob = new Blob([qrSvg], { type: "image/svg+xml" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    const targetLabel = destinationType === "hub" ? "Hub" : "Menu";
    a.download = `${cafeName.replace(/\s+/g, "_")}_QR_${targetLabel}${tableNumber ? `_Masa_${tableNumber}` : ""}.svg`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Yazdırma
  const handlePrint = () => {
    window.print();
  };

  // Linki Kopyalama
  const handleCopyLink = () => {
    navigator.clipboard.writeText(fullUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold font-display text-stone-900 dark:text-stone-100">
          QR Kod Üretici & Masa Standı
        </h2>
        <p className="text-xs text-stone-500 dark:text-stone-400">
          Müşterilerinizin masada okutacağı yüksek çözünürlüklü dijital karşılama ve menü QR kodlarını üretin ve indirin.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Sol Kolon: Yapılandırma ve İndirme Butonları */}
        <div className="rounded-2xl bg-white dark:bg-stone-900 p-6 border border-stone-200/80 dark:border-stone-800 shadow-sm space-y-4">
          <div className="text-sm font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2">
            <QrCode className="h-4 w-4 text-amber-600" />
            <span>QR Kod Hedef & Masa Ayarları</span>
          </div>

          <div className="space-y-4 text-xs">
            {/* Hedef Sayfa Seçimi */}
            <div>
              <label className="block font-semibold text-stone-700 dark:text-stone-300 mb-1.5">
                QR Okutulduğunda Açılacak Deneyim
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setDestinationType("hub");
                    setCustomPath("");
                  }}
                  className={`p-3 rounded-xl border text-left flex flex-col gap-1 transition-all ${
                    destinationType === "hub" && !customPath
                      ? "bg-amber-500/10 border-amber-500 text-amber-950 dark:text-amber-200 font-semibold shadow-sm"
                      : "bg-stone-50 dark:bg-stone-800 border-stone-200 dark:border-stone-700 text-stone-600 dark:text-stone-400 hover:bg-stone-100"
                  }`}
                >
                  <div className="flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                    <span className="text-xs font-bold">Karşılama Hub&apos;ı (Önerilen)</span>
                  </div>
                  <p className="text-[10px] text-stone-500 dark:text-stone-400 leading-tight">
                    Menü butonu, ⭐ Google değerlendirme ve Wi-Fi kopyalama bir arada.
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setDestinationType("menu");
                    setCustomPath("");
                  }}
                  className={`p-3 rounded-xl border text-left flex flex-col gap-1 transition-all ${
                    destinationType === "menu" && !customPath
                      ? "bg-amber-500/10 border-amber-500 text-amber-950 dark:text-amber-200 font-semibold shadow-sm"
                      : "bg-stone-50 dark:bg-stone-800 border-stone-200 dark:border-stone-700 text-stone-600 dark:text-stone-400 hover:bg-stone-100"
                  }`}
                >
                  <div className="flex items-center gap-1.5">
                    <Compass className="w-3.5 h-3.5 text-amber-600" />
                    <span className="text-xs font-bold">Doğrudan Menü</span>
                  </div>
                  <p className="text-[10px] text-stone-500 dark:text-stone-400 leading-tight">
                    Doğrudan ürün kategorileri ve sipariş listesi açılır.
                  </p>
                </button>
              </div>
            </div>

            {/* Masa Numarası */}
            <div>
              <label className="block font-semibold text-stone-700 dark:text-stone-300 mb-1">
                Masa Numarası (Opsiyonel)
              </label>
              <input
                type="text"
                value={tableNumber}
                onChange={(e) => setTableNumber(e.target.value)}
                placeholder="Örn: 5 (Boş bırakırsanız genel kafe QR'ı olur)"
                className="w-full rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 p-2.5 text-stone-900 dark:text-stone-100 focus:ring-2 focus:ring-amber-500"
              />
              <div className="mt-2 flex items-center gap-1.5 flex-wrap">
                <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider">Hızlı Seç:</span>
                {["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "Bahçe-1", "Teras-1"].map((num) => (
                  <button
                    key={num}
                    type="button"
                    onClick={() => setTableNumber(num)}
                    className={`px-2 py-0.5 rounded-lg text-[11px] font-semibold border transition-all ${
                      tableNumber === num
                        ? "bg-amber-500 text-stone-950 border-amber-500 shadow-sm"
                        : "bg-stone-100 dark:bg-stone-800 border-stone-200 dark:border-stone-700 text-stone-600 dark:text-stone-300 hover:bg-stone-200"
                    }`}
                  >
                    #{num}
                  </button>
                ))}
                {tableNumber && (
                  <button
                    type="button"
                    onClick={() => setTableNumber("")}
                    className="px-2 py-0.5 rounded-lg text-[10px] font-bold text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40"
                  >
                    Temizle
                  </button>
                )}
              </div>
              <p className="mt-1 text-[11px] text-stone-400">
                Masa numarası seçildiğinde müşteri QR okuttuğunda &quot;Masa #{tableNumber}&quot; rozetiyle karşılanır.
              </p>
            </div>

            {/* Nihai Link & Kopyalama */}
            <div>
              <label className="block font-semibold text-stone-700 dark:text-stone-300 mb-1">
                Üretilen QR Bağlantısı
              </label>
              <div className="rounded-xl bg-stone-50 dark:bg-stone-800/80 p-3 border border-stone-200 dark:border-stone-700 flex items-center justify-between gap-2">
                <span className="font-mono text-[11px] text-stone-600 dark:text-stone-300 truncate">
                  {fullUrl}
                </span>
                <button
                  type="button"
                  onClick={handleCopyLink}
                  className="flex items-center gap-1 rounded-lg bg-stone-200 dark:bg-stone-700 px-2.5 py-1 text-[11px] font-semibold text-stone-700 dark:text-stone-200 hover:bg-stone-300"
                >
                  {copied ? <Check className="h-3 w-3 text-emerald-500" /> : <Copy className="h-3 w-3" />}
                  <span>{copied ? "Kopyalandı" : "Kopyala"}</span>
                </button>
              </div>
            </div>
          </div>

          {/* İndirme Butonları */}
          <div className="pt-2 flex flex-col gap-2.5">
            <button
              onClick={downloadPNG}
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-amber-600 px-4 py-2.5 text-xs font-bold text-white shadow hover:bg-amber-700 active:scale-98 transition-all"
            >
              <Download className="h-4 w-4" />
              <span>Yüksek Çözünürlüklü PNG İndir (Baskı İçin)</span>
            </button>

            <button
              onClick={downloadSVG}
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-stone-800 hover:bg-stone-900 text-white px-4 py-2.5 text-xs font-bold shadow active:scale-98 transition-all"
            >
              <Download className="h-4 w-4" />
              <span>Vektörel SVG Formatında İndir</span>
            </button>

            <button
              onClick={handlePrint}
              className="w-full flex items-center justify-center gap-2 rounded-xl border border-stone-300 dark:border-stone-700 px-4 py-2 text-xs font-bold text-stone-700 dark:text-stone-300 hover:bg-stone-50 dark:hover:bg-stone-800 transition-all"
            >
              <Printer className="h-4 w-4" />
              <span>Masa Standı Şablonunu Yazdır</span>
            </button>
          </div>
        </div>

        {/* Sağ Kolon: Canlı Masa Standı Önizlemesi */}
        <div
          ref={printRef}
          className="rounded-lg bg-white dark:bg-slate-900 p-6 border border-slate-200 dark:border-slate-800 flex flex-col items-center justify-center text-center space-y-3"
        >
          <div className="space-y-1">
            <span className="text-[11px] uppercase tracking-wider font-semibold text-slate-500">
              {destinationType === "hub" ? "Hoş Geldiniz" : "Temassız Menü"}
            </span>
            <h3 className="text-xl font-black font-display text-stone-900 dark:text-stone-100">
              {cafeName}
            </h3>
            {tableNumber && (
              <span className="inline-block rounded-full bg-amber-500/10 border border-amber-500/20 px-3 py-0.5 text-xs font-bold text-amber-700 dark:text-amber-300">
                Masa #{tableNumber}
              </span>
            )}
          </div>

          {/* QR Önizleme Kartı */}
          <div className="relative p-4 rounded-2xl bg-white shadow-inner border border-stone-200">
            {qrDataUrl ? (
              <img
                src={qrDataUrl}
                alt="QR Kod"
                className="h-48 w-48 object-contain"
              />
            ) : (
              <div className="h-48 w-48 flex items-center justify-center text-xs text-stone-400">
                QR Üretiliyor...
              </div>
            )}
          </div>

          <div className="space-y-1">
            <p className="text-xs font-bold text-stone-700 dark:text-stone-300">
              Kameranız ile QR Kodu Okutun
            </p>
            <p className="text-[11px] text-stone-400 max-w-xs">
              {destinationType === "hub"
                ? "Menüyü inceleyin, Google'da değerlendirin ve tek tıkla Wi-Fi ağına bağlanın."
                : "Uygulama indirmeye gerek kalmadan tüm kahve, tatlı ve içecek çeşitlerimizi inceleyin."}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
