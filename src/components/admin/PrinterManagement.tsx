"use client";

import React, { useState, useEffect } from "react";
import {
  Printer,
  Save,
  Play,
  CheckCircle2,
  ChefHat,
  Coffee,
  Monitor,
  Flame,
  Terminal,
} from "lucide-react";

interface PrinterConfig {
  cashier: { type: "usb" | "network"; ip?: string; port: number; enabled: boolean };
  kitchen: { type: "network"; ip: string; port: number; enabled: boolean };
  bar: { type: "network"; ip: string; port: number; enabled: boolean };
  hookah: { type: "network"; ip: string; port: number; enabled: boolean };
}

const DEFAULT_CONFIG: PrinterConfig = {
  cashier: { type: "usb", port: 9100, enabled: true },
  kitchen: { type: "network", ip: "192.168.1.200", port: 9100, enabled: true },
  bar: { type: "network", ip: "192.168.1.201", port: 9100, enabled: true },
  hookah: { type: "network", ip: "192.168.1.202", port: 9100, enabled: true },
};

export default function PrinterManagement() {
  const [config, setConfig] = useState<PrinterConfig>(DEFAULT_CONFIG);
  const [saved, setSaved] = useState(false);
  const [testingStation, setTestingStation] = useState<string | null>(null);
  const [testResult, setTestResult] = useState<string | null>(null);

  useEffect(() => {
    try {
      const stored = localStorage.getItem("printer_network_config");
      if (stored) {
        setConfig(JSON.parse(stored));
      }
    } catch {}
  }, []);

  const handleSave = () => {
    try {
      localStorage.setItem("printer_network_config", JSON.stringify(config));
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch {}
  };

  const handleTestPrint = async (station: "kitchen" | "bar" | "hookah" | "cashier") => {
    setTestingStation(station);
    setTestResult(null);

    const testReceipt = {
      type: station === "cashier" ? "bill" : "kitchen",
      cafeName: "Test Fişi • Gloriouss Café",
      tableNumber: "TEST-1",
      kdsStation: station,
      createdAt: new Date(),
      items: [
        {
          id: "test-1",
          productName: "80mm Termal Donanım Testi",
          quantity: 1,
          unitPrice: 100,
          totalPrice: 100,
        },
      ],
      totalAmount: 100,
      notes: "Donanım test çıktısı.",
    };

    try {
      const res = await fetch("/api/print-queue", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          receipt: testReceipt,
          station,
        }),
      });

      if (res.ok) {
        setTestResult(`${station.toUpperCase()} yazıcı kuyruğuna test fişi gönderildi.`);
        setTimeout(() => setTestResult(null), 4000);
      }
    } catch {
      alert("Hata oluştu.");
    } finally {
      setTestingStation(null);
    }
  };

  return (
    <div className="space-y-4 max-w-4xl font-sans">
      {/* BAŞLIK KARTI */}
      <div className="rounded-lg bg-white dark:bg-slate-900 p-4 border border-slate-200 dark:border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 flex items-center justify-center">
            <Printer className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-900 dark:text-white">
              80mm Termal Yazıcı İstasyonları
            </h2>
            <p className="text-xs text-slate-500">
              Kasa (USB/Tarayıcı), Mutfak (LAN), Bar (LAN) ve Nargilehane (LAN) yazıcı adresleri.
            </p>
          </div>
        </div>

        {saved && (
          <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Kaydedildi</span>
          </span>
        )}
      </div>

      {/* YAZICI LİSTESİ */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {/* 1. KASA / HESAP YAZICISI */}
        <div className="rounded-lg bg-white dark:bg-slate-900 p-4 border border-slate-200 dark:border-slate-800 space-y-3">
          <div className="flex items-center justify-between pb-2.5 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <Monitor className="w-4 h-4 text-slate-500" />
              <div>
                <h4 className="text-xs font-semibold text-slate-900 dark:text-white">
                  Kasa Adisyon Yazıcısı
                </h4>
                <p className="text-[11px] text-slate-400">USB / Tarayıcı Varsayılanı</p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => handleTestPrint("cashier")}
              disabled={Boolean(testingStation)}
              className="py-1 px-2.5 rounded bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-medium transition-colors flex items-center gap-1"
            >
              <Play className="w-3 h-3" />
              <span>Test</span>
            </button>
          </div>

          <p className="text-xs text-slate-500 leading-relaxed">
            Kasa adisyonları doğrudan tarayıcı veya bağlı USB termal yazıcı üzerinden basılır.
          </p>
        </div>

        {/* 2. MUTFAK YAZICISI */}
        <div className="rounded-lg bg-white dark:bg-slate-900 p-4 border border-slate-200 dark:border-slate-800 space-y-3">
          <div className="flex items-center justify-between pb-2.5 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <ChefHat className="w-4 h-4 text-slate-500" />
              <div>
                <h4 className="text-xs font-semibold text-slate-900 dark:text-white">
                  Mutfak Yazıcısı
                </h4>
                <p className="text-[11px] text-slate-400">LAN Ethernet / Wi-Fi (ESC/POS)</p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => handleTestPrint("kitchen")}
              disabled={Boolean(testingStation)}
              className="py-1 px-2.5 rounded bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-medium transition-colors flex items-center gap-1"
            >
              <Play className="w-3 h-3" />
              <span>Test</span>
            </button>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <div className="col-span-2">
              <label className="text-[11px] font-medium text-slate-400 block mb-1">
                IP Adresi:
              </label>
              <input
                type="text"
                value={config.kitchen.ip}
                onChange={(e) =>
                  setConfig({
                    ...config,
                    kitchen: { ...config.kitchen, ip: e.target.value },
                  })
                }
                className="w-full rounded bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-1.5 text-xs font-mono"
              />
            </div>
            <div>
              <label className="text-[11px] font-medium text-slate-400 block mb-1">Port:</label>
              <input
                type="number"
                value={config.kitchen.port}
                onChange={(e) =>
                  setConfig({
                    ...config,
                    kitchen: { ...config.kitchen, port: Number(e.target.value) },
                  })
                }
                className="w-full rounded bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-1.5 text-xs font-mono"
              />
            </div>
          </div>
        </div>

        {/* 3. BAR YAZICISI */}
        <div className="rounded-lg bg-white dark:bg-slate-900 p-4 border border-slate-200 dark:border-slate-800 space-y-3">
          <div className="flex items-center justify-between pb-2.5 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <Coffee className="w-4 h-4 text-slate-500" />
              <div>
                <h4 className="text-xs font-semibold text-slate-900 dark:text-white">
                  Bar / Kahve Yazıcısı
                </h4>
                <p className="text-[11px] text-slate-400">LAN Ethernet / Wi-Fi (ESC/POS)</p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => handleTestPrint("bar")}
              disabled={Boolean(testingStation)}
              className="py-1 px-2.5 rounded bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-medium transition-colors flex items-center gap-1"
            >
              <Play className="w-3 h-3" />
              <span>Test</span>
            </button>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <div className="col-span-2">
              <label className="text-[11px] font-medium text-slate-400 block mb-1">
                IP Adresi:
              </label>
              <input
                type="text"
                value={config.bar.ip}
                onChange={(e) =>
                  setConfig({
                    ...config,
                    bar: { ...config.bar, ip: e.target.value },
                  })
                }
                className="w-full rounded bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-1.5 text-xs font-mono"
              />
            </div>
            <div>
              <label className="text-[11px] font-medium text-slate-400 block mb-1">Port:</label>
              <input
                type="number"
                value={config.bar.port}
                onChange={(e) =>
                  setConfig({
                    ...config,
                    bar: { ...config.bar, port: Number(e.target.value) },
                  })
                }
                className="w-full rounded bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-1.5 text-xs font-mono"
              />
            </div>
          </div>
        </div>

        {/* 4. NARGİLEHANE YAZICISI */}
        <div className="rounded-lg bg-white dark:bg-slate-900 p-4 border border-slate-200 dark:border-slate-800 space-y-3">
          <div className="flex items-center justify-between pb-2.5 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <Flame className="w-4 h-4 text-slate-500" />
              <div>
                <h4 className="text-xs font-semibold text-slate-900 dark:text-white">
                  Nargilehane Yazıcısı
                </h4>
                <p className="text-[11px] text-slate-400">LAN Ethernet / Wi-Fi (ESC/POS)</p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => handleTestPrint("hookah")}
              disabled={Boolean(testingStation)}
              className="py-1 px-2.5 rounded bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-medium transition-colors flex items-center gap-1"
            >
              <Play className="w-3 h-3" />
              <span>Test</span>
            </button>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <div className="col-span-2">
              <label className="text-[11px] font-medium text-slate-400 block mb-1">
                IP Adresi:
              </label>
              <input
                type="text"
                value={config.hookah.ip}
                onChange={(e) =>
                  setConfig({
                    ...config,
                    hookah: { ...config.hookah, ip: e.target.value },
                  })
                }
                className="w-full rounded bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-1.5 text-xs font-mono"
              />
            </div>
            <div>
              <label className="text-[11px] font-medium text-slate-400 block mb-1">Port:</label>
              <input
                type="number"
                value={config.hookah.port}
                onChange={(e) =>
                  setConfig({
                    ...config,
                    hookah: { ...config.hookah, port: Number(e.target.value) },
                  })
                }
                className="w-full rounded bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-1.5 text-xs font-mono"
              />
            </div>
          </div>
        </div>
      </div>

      {testResult && (
        <div className="p-2.5 rounded bg-emerald-950/60 border border-emerald-800 text-emerald-400 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4" />
          <span>{testResult}</span>
        </div>
      )}

      {/* YEREL YAZDIRMA KÖPRÜSÜ (PRINT-BRIDGE) KILAVUZU */}
      <div className="rounded-lg bg-slate-900 border border-slate-800 p-4 space-y-2">
        <div className="flex items-center gap-2 text-white font-semibold text-xs">
          <Terminal className="w-4 h-4 text-slate-400" />
          <span>Yerel Termal Yazıcı Köprüsü (Print-Bridge Service)</span>
        </div>
        <p className="text-xs text-slate-400 leading-relaxed">
          Sistemin yerel ağdaki (192.168.1.X:9100) termal yazıcılara raw ESC/POS çıktısı göndermesi için:
        </p>
        <div className="p-2 rounded bg-slate-950 font-mono text-xs text-amber-400 border border-slate-800">
          node print-agent/print-bridge.js
        </div>
      </div>

      {/* KAYDET BUTONU */}
      <div className="flex justify-end pt-1">
        <button
          type="button"
          onClick={handleSave}
          className="py-2 px-4 rounded bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 dark:hover:bg-slate-700 text-white font-medium text-xs flex items-center gap-1.5 transition-colors"
        >
          <Save className="w-3.5 h-3.5" />
          <span>Yapılandırmayı Kaydet</span>
        </button>
      </div>
    </div>
  );
}
