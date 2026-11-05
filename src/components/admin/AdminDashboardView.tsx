"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Coffee,
  Package,
  Layers,
  Settings,
  QrCode,
  LogOut,
  ExternalLink,
  CheckCircle2,
  XCircle,
  Flame,
  Sparkles,
} from "lucide-react";
import ProductManagement from "./ProductManagement";
import CategoryManagement from "./CategoryManagement";
import CampaignManagement from "./CampaignManagement";
import SettingsManagement from "./SettingsManagement";
import QrCodeGenerator from "./QrCodeGenerator";
import PrinterManagement from "./PrinterManagement";
import { logoutAdminAction } from "@/actions/auth";
import { CategoryItem, BusinessSettingsData, CampaignItem } from "@/lib/types";
import { Printer } from "lucide-react";

interface AdminDashboardViewProps {
  categories: CategoryItem[];
  campaigns: CampaignItem[];
  settings: BusinessSettingsData;
  adminName: string;
}

type TabType = "products" | "categories" | "campaigns" | "settings" | "printers" | "qrcode";

export default function AdminDashboardView({
  categories,
  campaigns,
  settings,
  adminName,
}: AdminDashboardViewProps) {
  const [activeTab, setActiveTab] = useState<TabType>("products");

  // Ürünlerin düz listesi
  const allProducts = categories.flatMap((c) => c.products || []);
  const availableCount = allProducts.filter((p) => p.isAvailable).length;
  const outOfStockCount = allProducts.filter((p) => !p.isAvailable).length;
  const activeCampaignsCount = campaigns.filter((c) => c.isActive).length;
  const totalCrossSells = allProducts.reduce(
    (sum, p) => sum + (p.suggestions?.length || 0),
    0
  );

  const handleLogout = async () => {
    await logoutAdminAction();
  };

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans transition-colors">
      {/* Üst Navigasyon Çubuğu */}
      <header className="sticky top-0 z-40 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 h-14 flex items-center justify-between">
          {/* Sol: Logo & Kafe Adı */}
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded bg-slate-900 dark:bg-slate-800 text-white border border-slate-700">
              <Coffee className="h-4 w-4 text-amber-500" />
            </div>
            <div>
              <h1 className="text-sm font-bold text-slate-900 dark:text-white leading-tight">
                {settings.cafeName}
              </h1>
              <p className="text-[11px] text-slate-500">Yönetim Paneli</p>
            </div>
          </div>

          {/* Sağ: KDS, Garson, Canlı Menü ve Çıkış */}
          <div className="flex items-center gap-2">
            <Link
              href="/kds"
              target="_blank"
              className="inline-flex items-center gap-1.5 rounded bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 px-2.5 py-1 text-xs font-medium text-slate-700 dark:text-slate-300 hover:text-white hover:bg-slate-700 transition-colors"
              title="Mutfak & Bar KDS Ekranı"
            >
              <span>KDS Ekranı</span>
              <ExternalLink className="h-3 w-3 opacity-60" />
            </Link>

            <Link
              href="/waiter"
              target="_blank"
              className="inline-flex items-center gap-1.5 rounded bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 px-2.5 py-1 text-xs font-medium text-slate-700 dark:text-slate-300 hover:text-white hover:bg-slate-700 transition-colors"
              title="Garson El Terminali"
            >
              <span>Garson Paneli</span>
              <ExternalLink className="h-3 w-3 opacity-60" />
            </Link>

            <Link
              href="/menu"
              target="_blank"
              className="hidden sm:inline-flex items-center gap-1.5 rounded bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 px-2.5 py-1 text-xs font-medium text-slate-700 dark:text-slate-300 hover:text-white hover:bg-slate-700 transition-colors"
            >
              <span>Canlı Menü</span>
              <ExternalLink className="h-3 w-3 opacity-60" />
            </Link>

            <div className="hidden sm:block text-right border-l border-slate-200 dark:border-slate-800 pl-3 ml-1">
              <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">{adminName}</p>
              <span className="text-[10px] text-slate-400">Yönetici</span>
            </div>

            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 rounded bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 px-2.5 py-1 text-xs font-medium text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
              title="Çıkış Yap"
            >
              <LogOut className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Çıkış</span>
            </button>
          </div>
        </div>
      </header>

      {/* Ana Gövde */}
      <main className="mx-auto max-w-6xl px-4 sm:px-6 py-5 space-y-5">
        {/* İstatistik Kartları */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          <div className="rounded-lg bg-white dark:bg-slate-900 p-3.5 border border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-xs font-medium">Toplam Ürün</span>
              <Package className="h-4 w-4" />
            </div>
            <p className="mt-1 text-xl font-bold tabular-nums text-slate-900 dark:text-slate-100">
              {allProducts.length}
            </p>
          </div>

          <div className="rounded-lg bg-white dark:bg-slate-900 p-3.5 border border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-xs font-medium">Stokta Var</span>
              <CheckCircle2 className="h-4 w-4 text-emerald-500" />
            </div>
            <p className="mt-1 text-xl font-bold tabular-nums text-emerald-600 dark:text-emerald-400">
              {availableCount}
            </p>
          </div>

          <div className="rounded-lg bg-white dark:bg-slate-900 p-3.5 border border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-xs font-medium">Tükenen</span>
              <XCircle className="h-4 w-4 text-rose-500" />
            </div>
            <p className="mt-1 text-xl font-bold tabular-nums text-rose-600 dark:text-rose-400">
              {outOfStockCount}
            </p>
          </div>

          <div className="rounded-lg bg-white dark:bg-slate-900 p-3.5 border border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-xs font-medium">Kampanyalar</span>
              <Layers className="h-4 w-4 text-amber-500" />
            </div>
            <p className="mt-1 text-xl font-bold tabular-nums text-slate-900 dark:text-slate-100">
              {activeCampaignsCount}
            </p>
          </div>

          <div className="rounded-lg bg-white dark:bg-slate-900 p-3.5 border border-slate-200 dark:border-slate-800 col-span-2 sm:col-span-1">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-xs font-medium">Kategoriler</span>
              <Layers className="h-4 w-4" />
            </div>
            <p className="mt-1 text-xl font-bold tabular-nums text-slate-900 dark:text-slate-100">
              {categories.length}
            </p>
          </div>
        </div>

        {/* Sekme Menüsü */}
        <div className="flex items-center gap-1.5 border-b border-slate-200 dark:border-slate-800 pb-2 overflow-x-auto no-scrollbar">
          <button
            onClick={() => setActiveTab("products")}
            className={`flex items-center gap-1.5 rounded px-3 py-1.5 text-xs font-medium transition-colors ${
              activeTab === "products"
                ? "bg-slate-900 dark:bg-slate-800 text-white"
                : "text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800"
            }`}
          >
            <Package className="h-3.5 w-3.5" />
            <span>Ürünler ({allProducts.length})</span>
          </button>

          <button
            onClick={() => setActiveTab("campaigns")}
            className={`flex items-center gap-1.5 rounded px-3 py-1.5 text-xs font-medium transition-colors ${
              activeTab === "campaigns"
                ? "bg-slate-900 dark:bg-slate-800 text-white"
                : "text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800"
            }`}
          >
            <Layers className="h-3.5 w-3.5" />
            <span>Kampanyalar ({campaigns.length})</span>
          </button>

          <button
            onClick={() => setActiveTab("categories")}
            className={`flex items-center gap-1.5 rounded px-3 py-1.5 text-xs font-medium transition-colors ${
              activeTab === "categories"
                ? "bg-slate-900 dark:bg-slate-800 text-white"
                : "text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800"
            }`}
          >
            <Layers className="h-3.5 w-3.5" />
            <span>Kategoriler ({categories.length})</span>
          </button>

          <button
            onClick={() => setActiveTab("qrcode")}
            className={`flex items-center gap-1.5 rounded px-3 py-1.5 text-xs font-medium transition-colors ${
              activeTab === "qrcode"
                ? "bg-slate-900 dark:bg-slate-800 text-white"
                : "text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800"
            }`}
          >
            <QrCode className="h-3.5 w-3.5" />
            <span>QR Kod</span>
          </button>

          <button
            onClick={() => setActiveTab("printers")}
            className={`flex items-center gap-1.5 rounded px-3 py-1.5 text-xs font-medium transition-colors ${
              activeTab === "printers"
                ? "bg-slate-900 dark:bg-slate-800 text-white"
                : "text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800"
            }`}
          >
            <Printer className="h-3.5 w-3.5" />
            <span>Yazıcılar</span>
          </button>

          <button
            onClick={() => setActiveTab("settings")}
            className={`flex items-center gap-1.5 rounded px-3 py-1.5 text-xs font-medium transition-colors ${
              activeTab === "settings"
                ? "bg-slate-900 dark:bg-slate-800 text-white"
                : "text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800"
            }`}
          >
            <Settings className="h-3.5 w-3.5" />
            <span>Ayarlar</span>
          </button>
        </div>

        {/* Aktif Sekme İçeriği */}
        <div className="pt-2">
          {activeTab === "products" && (
            <ProductManagement products={allProducts} categories={categories} />
          )}

          {activeTab === "campaigns" && (
            <CampaignManagement campaigns={campaigns} />
          )}

          {activeTab === "categories" && (
            <CategoryManagement categories={categories} />
          )}

          {activeTab === "qrcode" && (
            <QrCodeGenerator cafeName={settings.cafeName} />
          )}

          {activeTab === "printers" && (
            <PrinterManagement />
          )}

          {activeTab === "settings" && (
            <SettingsManagement settings={settings} categories={categories} />
          )}
        </div>
      </main>
    </div>
  );
}
