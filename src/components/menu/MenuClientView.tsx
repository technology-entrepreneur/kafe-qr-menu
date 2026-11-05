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
import ServiceCallModal from "./ServiceCallModal";
import ActiveOrdersDrawer from "./ActiveOrdersDrawer";
import BillSplitDrawer from "./BillSplitDrawer";
import TablePickerModal from "./TablePickerModal";
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
import { t } from "@/lib/translations";
import { useDebounce } from "@/lib/hooks/useDebounce";
import { useTableSession } from "@/lib/hooks/useTableSession";
import { useSSE } from "@/lib/hooks/useSSE";
import { Search, X, SearchX, CheckCircle2, RefreshCw } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

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
  // Dil Durumu (TR / EN / AR / RU / DE)
  const [language, setLanguage] = useState<Language>("tr");
  const isEn = language === "en";

  useEffect(() => {
    try {
      const saved = localStorage.getItem("preferred_menu_lang") as Language;
      if (saved && ["tr", "en", "ar", "ru", "de"].includes(saved)) {
        setLanguage(saved);
      }
    } catch {}
  }, []);

  // Masa Numarası Yönetimi (URL veya yerel hafıza / manuel seçim)
  const [activeTableNumber, setActiveTableNumber] = useState<string | null>(tableNumber || null);
  const [isTableModalOpen, setIsTableModalOpen] = useState(false);

  useEffect(() => {
    if (tableNumber) {
      setActiveTableNumber(tableNumber);
      try { localStorage.setItem("preferred_table_number", tableNumber); } catch {}
    } else {
      try {
        const saved = localStorage.getItem("preferred_table_number");
        if (saved) setActiveTableNumber(saved);
      } catch {}
    }
  }, [tableNumber]);

  // Masa Canlı Oturumu (TableSession)
  const {
    session,
    isLoading: isSessionLoading,
    sessionReset,
    totalAmount: activeTableTotal,
    allItems: activeTableItems,
  } = useTableSession(activeTableNumber);

  // Arama Sorgusu & Debounce
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearchQuery = useDebounce(searchQuery, 280);

  // Canlı Stok Durumu (86'ing - Tükendi senkronizasyonu için yerel override haritası)
  const [stockOverrides, setStockOverrides] = useState<Record<string, boolean>>({});
  const [transferNotice, setTransferNotice] = useState<string | null>(null);

  // SSE ile Canlı Olayları Dinleme
  useSSE({
    role: "customer",
    tableNumber: activeTableNumber || undefined,
    onEvent(event, data: any) {
      if (event === "product_availability_changed") {
        setStockOverrides((prev) => ({
          ...prev,
          [data.productId]: data.isAvailable,
        }));
      }

      if (event === "table_transferred" && data.fromTable === tableNumber) {
        setTransferNotice(`Masanız Masa ${data.toTable}'ye taşınmıştır.`);
        setTimeout(() => {
          window.location.href = `/menu?table=${encodeURIComponent(data.toTable)}`;
        }, 2500);
      }
    },
  });

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

    return baseList.map((cat) => {
      const localized = localizeCategory(cat, language);
      return {
        ...localized,
        products: (localized.products || []).map((p) => {
          if (stockOverrides[p.id] !== undefined) {
            return { ...p, isAvailable: stockOverrides[p.id] };
          }
          return p;
        }),
      };
    });
  }, [initialCategories, language, stockOverrides]);

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

  // Masa Hizmet / Garson Çağrı Modalı
  const [isServiceCallOpen, setIsServiceCallOpen] = useState(false);

  // Masa Hesabım / Canlı Adisyon Çekmecesi
  const [isActiveOrdersOpen, setIsActiveOrdersOpen] = useState(false);

  // Alman Usulü Hesap Bölüştürücü Çekmecesi
  const [isBillSplitOpen, setIsBillSplitOpen] = useState(false);

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

  // Kategori Seçimi & Pürüzsüz Kaydırma
  const handleSelectCategory = useCallback((categoryId: string) => {
    setActiveCategoryId(categoryId);
    const target = document.getElementById(`category-${categoryId}`);
    const dock = document.getElementById("sticky-menu-dock");
    if (target) {
      const dockHeight = dock ? dock.getBoundingClientRect().height : 98;
      const elementTop = target.getBoundingClientRect().top + window.scrollY;
      const offsetTarget = elementTop - dockHeight - 16;
      window.scrollTo({
        top: Math.max(0, offsetTarget),
        behavior: "smooth",
      });
    }
  }, []);

  // Kaydırma Takibi (Active category indicator)
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
    <div
      dir={language === "ar" ? "rtl" : "ltr"}
      className="min-h-screen bg-[#080706] text-stone-100 flex flex-col font-sans selection:bg-amber-500 selection:text-black"
    >
      {/* 0. Çevrimdışı / Ağ Durumu Uyarısı */}
      <NetworkOfflineBanner />

      {/* MASA TAŞINDI BİLDİRİMİ */}
      {transferNotice && (
        <div className="fixed top-3 inset-x-3 z-50 max-w-md mx-auto">
          <div className="p-3 rounded-lg bg-sky-950 border border-sky-800 text-sky-200 flex items-center gap-2.5 shadow-md">
            <RefreshCw className="w-4 h-4 flex-shrink-0 animate-spin" />
            <div>
              <p className="font-semibold text-xs">Masa Taşıma İşlemi</p>
              <p className="text-[11px] text-sky-300">{transferNotice} Yönlendiriliyorsunuz...</p>
            </div>
          </div>
        </div>
      )}

      {/* MASA KAPATILDI BİLDİRİMİ */}
      {sessionReset && (
        <div className="fixed top-3 inset-x-3 z-50 max-w-md mx-auto">
          <div className="p-3 rounded-lg bg-emerald-950 border border-emerald-800 text-emerald-200 flex items-center gap-2.5 shadow-md">
            <CheckCircle2 className="w-4 h-4 flex-shrink-0 text-emerald-400" />
            <div>
              <p className="font-semibold text-xs">
                {isEn ? "Table Session Closed" : "Masa Hesabı Kapatıldı"}
              </p>
              <p className="text-[11px] text-emerald-300">
                {isEn
                  ? "Menu refreshed for new guests."
                  : "Menü yeni sipariş için hazırlandı."}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ==================================================== */}
      {/* 1. KAFE KİMLİĞİ & KARŞILAMA HERO ALANI               */}
      {/* ==================================================== */}
      <MenuHero
        settings={settings}
        campaigns={campaigns}
        tableNumber={activeTableNumber}
        language={language}
        onLanguageChange={setLanguage}
        onOpenWifi={() => setIsWifiOpen(true)}
        onOpenTableModal={() => setIsTableModalOpen(true)}
        onSelectCampaign={(camp) => setSelectedCampaign(camp)}
      />

      {/* ==================================================== */}
      {/* 2. SABİT GEZİNME DOKU (Unified Sticky Dock)          */}
      {/* ==================================================== */}
      <div
        id="sticky-menu-dock"
        className="sticky top-0 z-30 w-full bg-[#0c0a08]/95 backdrop-blur-md border-b border-stone-800/80 transition-colors"
      >
        {/* Canlı Arama Girişi */}
        <div className="max-w-2xl mx-auto px-4 pt-2.5 pb-2">
          <div className="relative w-full">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t("searchPlaceholder", language)}
              className="w-full rounded-2xl bg-stone-900/90 border border-stone-800 py-2.5 pl-10 pr-9 text-xs sm:text-sm text-stone-100 placeholder-stone-500 focus:outline-none focus:ring-2 focus:ring-amber-500/40 focus:border-amber-500/50 transition-all shadow-inner"
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

        {/* Yatay Kategori Çubuğu */}
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
      <main className="flex-1 max-w-2xl w-full mx-auto px-4 pt-4 pb-28 space-y-8">
        {filteredCategories.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-12 h-12 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-500 mb-2">
              <SearchX className="w-6 h-6 text-slate-400" />
            </div>
            <h3 className="text-sm font-semibold text-slate-200">
              {isEn ? "No Products Found" : "Eşleşen Ürün Bulunamadı"}
            </h3>
            <p className="mt-1 text-xs text-slate-400 max-w-xs leading-relaxed">
              {isEn
                ? `No items match "${debouncedSearchQuery}".`
                : `"${debouncedSearchQuery}" için sonuç bulunamadı.`}
            </p>
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              className="mt-3 px-3 py-1.5 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium text-xs transition-colors"
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
                        isCatalogOnly={settings.isCatalogOnly}
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
      {/* 5. İNTERAKTİF ÜRÜN DETAY ÇEKMECESİ                   */}
      {/* ==================================================== */}
      <ProductDetailDrawer
        product={drawerProduct}
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        language={language}
        allProducts={allProducts}
        onSelectProduct={(p) => setDrawerProduct(p)}
        isCatalogOnly={settings.isCatalogOnly}
      />

      {/* ==================================================== */}
      {/* 6. SABİT ALT AKSİYON ÇUBUĞU (Sepet + Canlı Adisyon) */}
      {/* ==================================================== */}
      {!settings.isCatalogOnly && (
        <FloatingBar
          tableNumber={activeTableNumber}
          googleReviewUrl={settings.googleReviewUrl}
          language={language}
          activeOrdersCount={session?.orders?.length || 0}
          activeTableTotal={activeTableTotal}
          onOpenServiceCall={() => {
            if (!activeTableNumber) {
              setIsTableModalOpen(true);
            } else {
              setIsServiceCallOpen(true);
            }
          }}
          onOpenActiveOrders={() => {
            if (!activeTableNumber) {
              setIsTableModalOpen(true);
            } else {
              setIsActiveOrdersOpen(true);
            }
          }}
          onOpenBillSplit={() => {
            if (!activeTableNumber) {
              setIsTableModalOpen(true);
            } else {
              setIsBillSplitOpen(true);
            }
          }}
        />
      )}

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
      {!settings.isCatalogOnly && (
        <CartTrayDrawer
          language={language}
          tableNumber={activeTableNumber}
          sessionId={session?.id}
          onTableSelected={(tbl) => setActiveTableNumber(tbl)}
        />
      )}

      {/* ==================================================== */}
      {/* 9. FIRSAT & KAMPANYA DETAY ÇEKMECESİ                 */}
      {/* ==================================================== */}
      <CampaignDetailDrawer
        campaign={selectedCampaign}
        isOpen={Boolean(selectedCampaign)}
        onClose={() => setSelectedCampaign(null)}
        language={language}
        isCatalogOnly={settings.isCatalogOnly}
      />

      {/* ==================================================== */}
      {/* 10. GARSON ÇAĞIR / HESAP İSTE / KÖZ İSTE MODALI      */}
      {/* ==================================================== */}
      {activeTableNumber && (
        <ServiceCallModal
          isOpen={isServiceCallOpen}
          onClose={() => setIsServiceCallOpen(false)}
          tableNumber={activeTableNumber}
          sessionId={session?.id}
          language={language}
          hookahMode={settings.hookahMode ?? false}
          googleReviewUrl={settings.googleReviewUrl}
          enableGoogleReviewPrompt={settings.enableGoogleReviewPrompt ?? true}
          onOpenBillSplit={() => setIsBillSplitOpen(true)}
        />
      )}

      {/* ==================================================== */}
      {/* 11. MASA HESABIM / CANLI ADİSYON ÇEKMECESİ           */}
      {/* ==================================================== */}
      {activeTableNumber && (
        <ActiveOrdersDrawer
          isOpen={isActiveOrdersOpen}
          onClose={() => setIsActiveOrdersOpen(false)}
          tableNumber={activeTableNumber}
          orders={session?.orders || []}
          totalAmount={activeTableTotal}
          language={language}
          onOpenBillModal={() => setIsServiceCallOpen(true)}
          onOpenBillSplit={() => setIsBillSplitOpen(true)}
        />
      )}

      {/* ==================================================== */}
      {/* 12. ALMAN USULÜ HESAP BÖLÜŞTÜRÜCÜ ÇEKMECESİ          */}
      {/* ==================================================== */}
      {activeTableNumber && (
        <BillSplitDrawer
          isOpen={isBillSplitOpen}
          onClose={() => setIsBillSplitOpen(false)}
          items={activeTableItems}
          totalTableAmount={activeTableTotal}
          tableNumber={activeTableNumber}
          language={language}
          onRequestBillWithSplit={(share) => {
            setIsServiceCallOpen(true);
          }}
        />
      )}

      {/* ==================================================== */}
      {/* 13. MASA NUMARASI SEÇİM MODALI                       */}
      {/* ==================================================== */}
      <TablePickerModal
        isOpen={isTableModalOpen}
        onClose={() => setIsTableModalOpen(false)}
        currentTable={activeTableNumber}
        onSelectTable={(tbl) => {
          setActiveTableNumber(tbl);
          try {
            localStorage.setItem("preferred_table_number", tbl);
          } catch {}
        }}
        language={language}
      />
    </div>
  );
}
