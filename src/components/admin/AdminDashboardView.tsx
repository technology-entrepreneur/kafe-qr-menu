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
import { logoutAdminAction } from "@/actions/auth";
import { CategoryItem, BusinessSettingsData, CampaignItem } from "@/lib/types";

interface AdminDashboardViewProps {
  categories: CategoryItem[];
  campaigns: CampaignItem[];
  settings: BusinessSettingsData;
  adminName: string;
}

type TabType = "products" | "categories" | "campaigns" | "settings" | "qrcode";

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
    <div className="min-h-screen bg-[#faf8f5] dark:bg-[#12100e] text-stone-900 dark:text-stone-100 font-sans transition-colors">
      {/* Üst Navigasyon Çubuğu */}
      <header className="sticky top-0 z-40 bg-white/95 dark:bg-stone-900/95 backdrop-blur-md border-b border-stone-200/80 dark:border-stone-800">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 h-16 flex items-center justify-between">
          {/* Sol: Logo & Kafe Adı */}
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-600 text-white shadow-md">
              <Coffee className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-base font-extrabold font-display leading-tight text-stone-900 dark:text-stone-100">
                {settings.cafeName}
              </h1>
              <p className="text-[11px] text-stone-400">Yönetim & Satış Geliştirme (CRO) Paneli</p>
            </div>
          </div>

          {/* Sağ: Hub ve Menüye Git, Admin Bilgisi & Çıkış */}
          <div className="flex items-center gap-2.5">
            <Link
              href="/"
              target="_blank"
              className="hidden sm:inline-flex items-center gap-1.5 rounded-xl bg-amber-500/10 border border-amber-500/20 px-3 py-1.5 text-xs font-semibold text-amber-700 dark:text-amber-300 hover:bg-amber-500/20 transition-colors"
              title="Yeni Karşılama & Eylem Hub'ı"
            >
              <Sparkles className="h-3.5 w-3.5 text-amber-500" />
              <span>Karşılama Hub&apos;ı</span>
              <ExternalLink className="h-3 w-3 opacity-60" />
            </Link>

            <Link
              href="/menu"
              target="_blank"
              className="hidden sm:inline-flex items-center gap-1.5 rounded-xl bg-stone-100 dark:bg-stone-800 px-3 py-1.5 text-xs font-semibold text-stone-700 dark:text-stone-300 hover:bg-stone-200 dark:hover:bg-stone-700 transition-colors"
            >
              <span>Canlı Menü</span>
              <ExternalLink className="h-3.5 w-3.5" />
            </Link>

            <div className="hidden sm:block text-right">
              <p className="text-xs font-bold text-stone-800 dark:text-stone-200">{adminName}</p>
              <span className="text-[10px] text-emerald-500 font-medium">● Yönetici</span>
            </div>

            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 rounded-xl bg-stone-100 dark:bg-stone-800 px-3 py-1.5 text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
              title="Çıkış Yap"
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">Çıkış</span>
            </button>
          </div>
        </div>
      </header>

      {/* Ana Gövde */}
      <main className="mx-auto max-w-6xl px-4 sm:px-6 py-6 space-y-6">
        {/* İstatistik Bento Kartları */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 sm:gap-4">
          <div className="rounded-2xl bg-white dark:bg-stone-900 p-4 border border-stone-200/80 dark:border-stone-800 shadow-sm">
            <div className="flex items-center justify-between text-stone-400">
              <span className="text-xs font-medium">Toplam Ürün</span>
              <Package className="h-4 w-4 text-amber-600" />
            </div>
            <p className="mt-2 text-2xl font-black font-display text-stone-900 dark:text-stone-100">
              {allProducts.length}
            </p>
          </div>

          <div className="rounded-2xl bg-white dark:bg-stone-900 p-4 border border-stone-200/80 dark:border-stone-800 shadow-sm">
            <div className="flex items-center justify-between text-stone-400">
              <span className="text-xs font-medium">Stokta Var</span>
              <CheckCircle2 className="h-4 w-4 text-emerald-500" />
            </div>
            <p className="mt-2 text-2xl font-black font-display text-emerald-600 dark:text-emerald-400">
              {availableCount}
            </p>
          </div>

          <div className="rounded-2xl bg-white dark:bg-stone-900 p-4 border border-stone-200/80 dark:border-stone-800 shadow-sm">
            <div className="flex items-center justify-between text-stone-400">
              <span className="text-xs font-medium">Aktif Fırsatlar</span>
              <Flame className="h-4 w-4 text-amber-500 fill-amber-500" />
            </div>
            <p className="mt-2 text-2xl font-black font-display text-amber-600 dark:text-amber-400">
              {activeCampaignsCount}
            </p>
          </div>

          <div className="rounded-2xl bg-white dark:bg-stone-900 p-4 border border-stone-200/80 dark:border-stone-800 shadow-sm">
            <div className="flex items-center justify-between text-stone-400">
              <span className="text-xs font-medium">Çapraz Satışlar</span>
              <Sparkles className="h-4 w-4 text-amber-600" />
            </div>
            <p className="mt-2 text-2xl font-black font-display text-stone-900 dark:text-stone-100">
              {totalCrossSells}
            </p>
          </div>

          <div className="rounded-2xl bg-white dark:bg-stone-900 p-4 border border-stone-200/80 dark:border-stone-800 shadow-sm col-span-2 sm:col-span-1">
            <div className="flex items-center justify-between text-stone-400">
              <span className="text-xs font-medium">Kategoriler</span>
              <Layers className="h-4 w-4 text-amber-600" />
            </div>
            <p className="mt-2 text-2xl font-black font-display text-stone-900 dark:text-stone-100">
              {categories.length}
            </p>
          </div>
        </div>

        {/* Sekme Menüsü */}
        <div className="flex items-center gap-2 border-b border-stone-200 dark:border-stone-800 pb-2 overflow-x-auto no-scrollbar">
          <button
            onClick={() => setActiveTab("products")}
            className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition-all ${
              activeTab === "products"
                ? "bg-amber-600 text-white shadow-md"
                : "text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800"
            }`}
          >
            <Package className="h-4 w-4" />
            <span>Ürünler ({allProducts.length})</span>
          </button>

          <button
            onClick={() => setActiveTab("campaigns")}
            className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition-all ${
              activeTab === "campaigns"
                ? "bg-amber-600 text-white shadow-md"
                : "text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800"
            }`}
          >
            <Flame className="h-4 w-4 fill-current" />
            <span>Fırsatlar & Kampanyalar ({campaigns.length})</span>
          </button>

          <button
            onClick={() => setActiveTab("categories")}
            className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition-all ${
              activeTab === "categories"
                ? "bg-amber-600 text-white shadow-md"
                : "text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800"
            }`}
          >
            <Layers className="h-4 w-4" />
            <span>Kategoriler ({categories.length})</span>
          </button>

          <button
            onClick={() => setActiveTab("qrcode")}
            className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition-all ${
              activeTab === "qrcode"
                ? "bg-amber-600 text-white shadow-md"
                : "text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800"
            }`}
          >
            <QrCode className="h-4 w-4" />
            <span>QR Kod Üretici</span>
          </button>

          <button
            onClick={() => setActiveTab("settings")}
            className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition-all ${
              activeTab === "settings"
                ? "bg-amber-600 text-white shadow-md"
                : "text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800"
            }`}
          >
            <Settings className="h-4 w-4" />
            <span>İşletme Ayarları</span>
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

          {activeTab === "settings" && (
            <SettingsManagement settings={settings} />
          )}
        </div>
      </main>
    </div>
  );
}
