"use client";

import React, { useState, useMemo, useEffect, useCallback } from "react";
import MenuHero from "./MenuHero";
import CategoryNav from "./CategoryNav";
import ProductCard from "./ProductCard";
import ProductDetailDrawer from "./ProductDetailDrawer";
import FloatingBar from "./FloatingBar";
import GoogleReviewCard from "./GoogleReviewCard";
import WifiModal from "./WifiModal";
import CartTrayDrawer from "./CartTrayDrawer";
import CampaignDetailDrawer from "./CampaignDetailDrawer";
import NetworkOfflineBanner from "@/components/ui/NetworkOfflineBanner";
import {
  CategoryItem,
  ProductItem,
  BusinessSettingsData,
  CampaignItem,
  Language,
} from "@/types/menu";
import { demoCategories } from "@/lib/mockData";
import { localizeCategory } from "@/lib/menuTranslations";
import { useDebounce } from "@/lib/hooks/useDebounce";
import { Search, X, SearchX } from "lucide-react";

interface MenuClientViewProps {
  categories: CategoryItem[];
  campaigns: CampaignItem[];
  settings: BusinessSettingsData;
  tableNumber?: string | null;
}

export default function MenuClientView({
  categories: initialCategories,
  campaigns,
  settings,
  tableNumber,
}: MenuClientViewProps) {
  // Dil Durumu (TR / EN)
  const [language, setLanguage] = useState<Language>("tr");
  const isEn = language === "en";

  // Arama Sorgusu & Debounce
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearchQuery = useDebounce(searchQuery, 280);

  // Veritabanı kategorileri ve zengin demo verilerini harmanla ve seçili dile göre yerelleştir
  const activeCategories = useMemo(() => {
    let baseList = demoCategories;
    if (initialCategories && initialCategories.length > 0) {
      const hasDetailedProducts = initialCategories.some(
        (c) => (c.products || []).length > 0
      );
      if (hasDetailedProducts) {
        baseList = initialCategories;
      }
    }
    return baseList.map((cat) => localizeCategory(cat, language));
  }, [initialCategories, language]);

  // Aktif Kategori ID'si
  const [activeCategoryId, setActiveCategoryId] = useState<string>(
    activeCategories[0]?.id || ""
  );

  // Detay Çekmecesi Durumu (Bottom Sheet Drawer)
  const [drawerProduct, setDrawerProduct] = useState<ProductItem | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // Fırsat / Kampanya Detay Çekmecesi Durumu
  const [selectedCampaign, setSelectedCampaign] = useState<CampaignItem | null>(null);

  // Wi-Fi Modal Durumu
  const [isWifiOpen, setIsWifiOpen] = useState(false);

  // Tüm aktif ürünlerin düz listesi (Çapraz satış ve arama için)
  const allProducts = useMemo(() => {
    return activeCategories.flatMap((c) => c.products || []);
  }, [activeCategories]);

function normalizeForSearch(text: string | null | undefined): string {
  if (!text) return "";
  return text
    .toLocaleLowerCase("tr-TR")
    .replace(/ı/g, "i")
    .replace(/ğ/g, "g")
    .replace(/ü/g, "u")
    .replace(/ş/g, "s")
    .replace(/ö/g, "o")
    .replace(/ç/g, "c")
    .trim();
}

  // Canlı Arama Filtrelemesi (Debounced Değer Üzerinden)
  const filteredCategories = useMemo(() => {
    if (!debouncedSearchQuery.trim()) return activeCategories;

    const q = normalizeForSearch(debouncedSearchQuery);
    return activeCategories
      .map((cat) => ({
        ...cat,
        products: (cat.products || []).filter((prod) => {
          const matchName = normalizeForSearch(prod.name).includes(q);
          const matchNameEn = normalizeForSearch(prod.nameEn).includes(q);
          const matchDesc = normalizeForSearch(prod.description).includes(q);
          const matchDescEn = normalizeForSearch(prod.descriptionEn).includes(q);
          const matchAllergens = normalizeForSearch(prod.allergens).includes(q);
          const matchDietary =
            prod.dietaryTags?.some((t) => normalizeForSearch(t).includes(q)) || false;

          return (
            matchName ||
            matchNameEn ||
            matchDesc ||
            matchDescEn ||
            matchAllergens ||
            matchDietary
          );
        }),
      }))
      .filter((cat) => (cat.products || []).length > 0);
  }, [activeCategories, debouncedSearchQuery]);

  // Kategori Seçimi & Pürüzsüz Kaydırma (Dinamik dock yüksekliği + 16px nefes payı)
  const handleSelectCategory = useCallback((categoryId: string) => {
    setActiveCategoryId(categoryId);
    const target = document.getElementById(`category-${categoryId}`);
    const dock = document.getElementById("sticky-menu-dock");
    if (target) {
      const dockHeight = dock ? dock.getBoundingClientRect().height : 98;
      const elementTop = target.getBoundingClientRect().top + window.scrollY;
      // Ekstra 16px pay ile kategori başlığı asla kesilmez
      const offsetTarget = elementTop - dockHeight - 16;
      window.scrollTo({
        top: Math.max(0, offsetTarget),
        behavior: "smooth",
      });
    }
  }, []);

  // requestAnimationFrame ile Throttled Kaydırma Takibi (60/120fps akıcı)
  useEffect(() => {
    if (debouncedSearchQuery.trim()) return;

    let ticking = false;

    const checkActiveCategory = () => {
      const dock = document.getElementById("sticky-menu-dock");
      const dockHeight = dock ? dock.getBoundingClientRect().height : 98;
      const scrollPosition = window.scrollY + dockHeight + 40;

      for (const cat of activeCategories) {
        const el = document.getElementById(`category-${cat.id}`);
        if (!el) continue;

        const top = el.offsetTop;
        const height = el.offsetHeight;

        if (scrollPosition >= top && scrollPosition < top + height) {
          setActiveCategoryId(cat.id);
          break;
        }
      }
      ticking = false;
    };

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(checkActiveCategory);
        ticking = true;
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [activeCategories, debouncedSearchQuery]);

  // Ürün Detay Çekmecesini Aç
  const handleOpenDrawer = (product: ProductItem) => {
    setDrawerProduct(product);
    setIsDrawerOpen(true);
  };

  return (
    <div className="min-h-screen bg-[#080706] text-stone-100 flex flex-col font-sans selection:bg-amber-500 selection:text-black">
      {/* 0. Çevrimdışı / Ağ Durumu Uyarısı */}
      <NetworkOfflineBanner />

      {/* ==================================================== */}
      {/* 1. KAFE KİMLİĞİ & KARŞILAMA HERO ALANI (Normal Flow)  */}
      {/* Sayfa aşağı kaydırıldığında doğal akışla yukarı kayar  */}
      {/* ==================================================== */}
      <MenuHero
        settings={settings}
        campaigns={campaigns}
        tableNumber={tableNumber}
        language={language}
        onLanguageChange={setLanguage}
        onOpenWifi={() => setIsWifiOpen(true)}
        onSelectCampaign={(camp) => setSelectedCampaign(camp)}
      />

      {/* ==================================================== */}
      {/* 2. SABİT GEZİNME DOKU (Unified Sticky Dock)          */}
      {/* Arama ve Kategori Navigasyonu tek parçada sabitlenir  */}
      {/* ==================================================== */}
      <div
        id="sticky-menu-dock"
        className="sticky top-0 z-40 w-full bg-[#080706]/95 backdrop-blur-2xl border-b border-stone-800/80 shadow-lg shadow-black/60 transition-all"
      >
        {/* Canlı Arama Girişi */}
        <div className="max-w-2xl mx-auto px-4 pt-2.5 pb-2">
          <div className="relative w-full">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={
                isEn
                  ? "Search coffee, pastry, ingredients or allergens..."
                  : "Kahve, tatlı, içerik veya alerjen ara..."
              }
              className="w-full rounded-2xl bg-stone-900/90 border border-stone-800/90 py-2.5 pl-10 pr-10 text-xs sm:text-sm text-stone-100 placeholder-stone-500 focus:outline-none focus:ring-2 focus:ring-amber-500/40 focus:border-amber-500/50 transition-all shadow-inner"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-stone-800 text-stone-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
                title={isEn ? "Clear search" : "Aramayı Temizle"}
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>
        </div>

        {/* Yatay Kategori Çubuğu (Arama yapılmıyorsa gösterilir) */}
        {!debouncedSearchQuery.trim() && (
          <CategoryNav
            categories={activeCategories}
            activeCategoryId={activeCategoryId}
            onSelectCategory={handleSelectCategory}
            language={language}
          />
        )}
      </div>

      {/* ==================================================== */}
      {/* 3. ANA İÇERİK & ÜRÜN LİSTESİ                         */}
      {/* ==================================================== */}
      <main className="flex-1 max-w-2xl w-full mx-auto px-4 pt-6 pb-32 space-y-10">
        {filteredCategories.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-16 h-16 rounded-3xl bg-stone-900 border border-stone-800 flex items-center justify-center text-stone-500 mb-3 shadow-inner">
              <SearchX className="w-8 h-8 text-amber-500" />
            </div>
            <h3 className="text-base font-bold text-stone-100 font-display">
              {isEn ? "No Products Found" : "Eşleşen Ürün Bulunamadı"}
            </h3>
            <p className="mt-1 text-xs text-stone-400 max-w-xs leading-relaxed">
              {isEn
                ? `No delicious items match "${debouncedSearchQuery}".`
                : `"${debouncedSearchQuery}" araması için eşleşen lezzet bulunamadı.`}
            </p>
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              className="mt-4 min-h-[44px] px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs shadow-md active:scale-95 transition-all cursor-pointer"
            >
              {isEn ? "Clear Search & View All" : "Aramayı Temizle ve Menüyü Gör"}
            </button>
          </div>
        ) : (
          filteredCategories.map((category) => {
            const displayName =
              isEn && category.nameEn ? category.nameEn : category.name;
            const productCount = category.products?.length || 0;

            return (
              <section
                key={category.id}
                id={`category-${category.id}`}
                className="scroll-mt-32 space-y-4"
              >
                {/* Kategori Başlığı Çizgisi */}
                <div className="flex items-center gap-3 pt-2 pb-1">
                  {category.icon && (
                    <span className="text-xl leading-none">{category.icon}</span>
                  )}
                  <h2 className="text-base sm:text-lg font-bold text-white tracking-tight leading-normal">
                    {displayName}
                  </h2>
                  <div className="h-[1px] flex-1 bg-stone-800/80" />
                  <span className="text-[11px] font-semibold text-stone-400 px-2.5 py-0.5 rounded-full bg-stone-900 border border-stone-800">
                    {productCount} {isEn ? "items" : "çeşit"}
                  </span>
                </div>

                {/* Kategori Ürün Kartları */}
                <div className="space-y-3">
                  {category.products && category.products.length > 0 ? (
                    category.products.map((product) => (
                      <ProductCard
                        key={product.id}
                        product={product}
                        onSelect={handleOpenDrawer}
                        language={language}
                      />
                    ))
                  ) : (
                    <p className="text-xs text-stone-500 italic py-2">
                      {isEn
                        ? "No products in this category yet."
                        : "Bu kategoride henüz ürün bulunmuyor."}
                    </p>
                  )}
                </div>
              </section>
            );
          })
        )}

        {/* 4. GOOGLE YORUM KARTI */}
        <div className="pt-4">
          <GoogleReviewCard
            reviewUrl={settings.googleReviewUrl}
            cafeName={settings.cafeName}
            language={language}
          />
        </div>
      </main>

      {/* ==================================================== */}
      {/* 5. İNTERAKTİF ÜRÜN DETAY ÇEKMECESİ (Bottom Sheet)    */}
      {/* ==================================================== */}
      <ProductDetailDrawer
        product={drawerProduct}
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        language={language}
        allProducts={allProducts}
        onSelectProduct={(p) => setDrawerProduct(p)}
      />

      {/* ==================================================== */}
      {/* 6. SABİT ALT AKSİYON ÇUBUĞU (Floating Bar - Tepsi)   */}
      {/* ==================================================== */}
      <FloatingBar
        tableNumber={tableNumber}
        googleReviewUrl={settings.googleReviewUrl}
        language={language}
      />

      {/* ==================================================== */}
      {/* 7. Wİ-Fİ BİLGİ MODALI                                */}
      {/* ==================================================== */}
      <WifiModal
        isOpen={isWifiOpen}
        onClose={() => setIsWifiOpen(false)}
        ssid={settings.wifiSsid}
        password={settings.wifiPassword}
        language={language}
      />

      {/* ==================================================== */}
      {/* 8. SİPARİŞ TEPSİSİ ÇEKMECESİ                         */}
      {/* ==================================================== */}
      <CartTrayDrawer
        language={language}
        tableNumber={tableNumber}
      />

      {/* ==================================================== */}
      {/* 9. FIRSAT & KAMPANYA DETAY ÇEKMECESİ                 */}
      {/* ==================================================== */}
      <CampaignDetailDrawer
        campaign={selectedCampaign}
        isOpen={Boolean(selectedCampaign)}
        onClose={() => setSelectedCampaign(null)}
        language={language}
      />
    </div>
  );
}
