"use client";

import { useState } from "react";
import {
  Save,
  Check,
  Coffee,
  Wifi,
  Share2,
  MapPin,
  Star,
  Upload,
  Sliders,
  Flame,
  Percent,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  TrendingUp,
} from "lucide-react";
import { BusinessSettingsData, CategoryItem } from "@/lib/types";
import { updateBusinessSettingsAction } from "@/actions/settings";

interface SettingsManagementProps {
  settings: BusinessSettingsData;
  categories?: CategoryItem[];
}

export default function SettingsManagement({
  settings,
  categories = [],
}: SettingsManagementProps) {
  const [saved, setSaved] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [logoInput, setLogoInput] = useState(settings.logoUrl || "");
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);

  // Modüler State'ler (Toggle'lar)
  const [businessType, setBusinessType] = useState(settings.businessType || "cafe");
  const [isCatalogOnly, setIsCatalogOnly] = useState(settings.isCatalogOnly ?? false);
  const [hookahMode, setHookahMode] = useState(settings.hookahMode ?? false);
  const [enableWaiterCall, setEnableWaiterCall] = useState(settings.enableWaiterCall ?? true);
  const [enableBillRequest, setEnableBillRequest] = useState(settings.enableBillRequest ?? true);
  const [enableQuickWifiBar, setEnableQuickWifiBar] = useState(settings.enableQuickWifiBar ?? true);
  const [enableGoogleReviewPrompt, setEnableGoogleReviewPrompt] = useState(settings.enableGoogleReviewPrompt ?? true);
  const [hookahCoalTimer, setHookahCoalTimer] = useState(settings.hookahCoalTimerMinutes ?? 25);
  const [hookahCooldown, setHookahCooldown] = useState(settings.hookahCoalCooldownMinutes ?? 10);

  // Toplu Fiyat Güncelleme State'leri
  const [bulkPercentage, setBulkPercentage] = useState<number>(15);
  const [bulkCategory, setBulkCategory] = useState<string>("all");
  const [roundNearest, setRoundNearest] = useState<number>(5);
  const [isBulkUpdating, setIsBulkUpdating] = useState(false);
  const [bulkSuccessMsg, setBulkSuccessMsg] = useState<string | null>(null);

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingLogo(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (data.url) {
        setLogoInput(data.url);
      }
    } catch {
      alert("Logo yüklenemedi.");
    } finally {
      setIsUploadingLogo(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSaving(true);
    setErrorMsg(null);

    const formData = new FormData(e.currentTarget);
    formData.set("logoUrl", logoInput);
    formData.set("businessType", businessType);
    formData.set("isCatalogOnly", String(isCatalogOnly));
    formData.set("hookahMode", String(hookahMode));
    formData.set("enableWaiterCall", String(enableWaiterCall));
    formData.set("enableBillRequest", String(enableBillRequest));
    formData.set("enableQuickWifiBar", String(enableQuickWifiBar));
    formData.set("enableGoogleReviewPrompt", String(enableGoogleReviewPrompt));
    formData.set("hookahCoalTimerMinutes", String(hookahCoalTimer));
    formData.set("hookahCoalCooldownMinutes", String(hookahCooldown));

    try {
      const res = await updateBusinessSettingsAction(formData);
      if (res && !res.success) {
        setErrorMsg(res.error || "Ayarlar kaydedilirken hata oluştu.");
        setIsSaving(false);
        return;
      }
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err: any) {
      setErrorMsg(err.message || "Kaydetme hatası.");
    } finally {
      setIsSaving(false);
    }
  };

  // Toplu Fiyat Güncelleme Tetikleme
  const handleBulkPriceUpdate = async () => {
    const confirmText = `${bulkCategory === "all" ? "TÜM MENÜYE" : "SEÇİLİ KATEGORİYE"} %${bulkPercentage} oranında fiyat güncellemesi uygulanacaktır. Onaylıyor musunuz?`;
    if (!confirm(confirmText)) return;

    setIsBulkUpdating(true);
    setBulkSuccessMsg(null);

    try {
      const res = await fetch("/api/products/bulk-price", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          percentage: bulkPercentage,
          categoryId: bulkCategory,
          roundToNearest: roundNearest,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setBulkSuccessMsg(`Toplam ${data.count || 0} ürünün fiyatı başarıyla güncellendi!`);
        setTimeout(() => setBulkSuccessMsg(null), 4000);
      } else {
        alert(data.error || "Fiyat güncellenemedi.");
      }
    } catch {
      alert("Sunucu hatası.");
    } finally {
      setIsBulkUpdating(false);
    }
  };

  return (
    <div className="space-y-5 max-w-4xl">
      {/* 1. TOPLU FİYAT GÜNCELLEME ARACI */}
      <div className="rounded-lg bg-white dark:bg-slate-900 p-5 border border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-3 pb-3 border-b border-slate-200 dark:border-slate-800">
          <div className="w-8 h-8 rounded bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 flex items-center justify-center">
            <TrendingUp className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Toplu Fiyat Güncelleme
            </h3>
            <p className="text-xs text-slate-500">
              Tüm menüye veya seçili kategoriye yüzde oranında zam veya indirim uygulayın.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3">
          <div>
            <label className="text-xs font-medium text-slate-700 dark:text-slate-300 block mb-1">
              Hedef Kategori:
            </label>
            <select
              value={bulkCategory}
              onChange={(e) => setBulkCategory(e.target.value)}
              className="w-full rounded bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 p-2 text-xs text-slate-900 dark:text-white"
            >
              <option value="all">Tüm Menü (Tüm Ürünler)</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs font-medium text-slate-700 dark:text-slate-300 block mb-1">
              Güncelleme Oranı (%):
            </label>
            <div className="flex items-center gap-1.5">
              <input
                type="number"
                value={bulkPercentage}
                onChange={(e) => setBulkPercentage(Number(e.target.value))}
                placeholder="% Oran (Örn: 15 veya -10)"
                className="w-full rounded bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 p-2 text-xs text-slate-900 dark:text-white font-medium"
              />
              <div className="flex gap-1">
                {[10, 15, 20].map((pct) => (
                  <button
                    key={pct}
                    type="button"
                    onClick={() => setBulkPercentage(pct)}
                    className="px-2 py-1 rounded text-xs bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 text-slate-700 dark:text-slate-300"
                  >
                    %{pct}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div>
            <label className="text-xs font-medium text-slate-700 dark:text-slate-300 block mb-1">
              Küsurat Yuvarlama:
            </label>
            <select
              value={roundNearest}
              onChange={(e) => setRoundNearest(Number(e.target.value))}
              className="w-full rounded bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 p-2 text-xs text-slate-900 dark:text-white"
            >
              <option value="5">En Yakın 5 TL</option>
              <option value="10">En Yakın 10 TL</option>
              <option value="0">Yuvarlama Yapma</option>
            </select>
          </div>
        </div>

        <div className="mt-3 flex items-center justify-between">
          {bulkSuccessMsg ? (
            <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>{bulkSuccessMsg}</span>
            </span>
          ) : (
            <span className="text-[11px] text-slate-500">
              * Değişiklikler anında menüde güncellenir.
            </span>
          )}

          <button
            type="button"
            onClick={handleBulkPriceUpdate}
            disabled={isBulkUpdating}
            className="py-1.5 px-3 rounded bg-amber-600 hover:bg-amber-500 text-white font-medium text-xs transition-colors disabled:opacity-50"
          >
            {isBulkUpdating ? "Güncelleniyor..." : "Fiyatları Güncelle"}
          </button>
        </div>
      </div>

      {/* 2. GENEL İŞLETME VE MODÜL AYARLARI FORMU */}
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* MODÜL VE İŞLETME PROFİLİ AYARLARI */}
        <div className="rounded-lg bg-white dark:bg-slate-900 p-5 border border-slate-200 dark:border-slate-800 space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-200 dark:border-slate-800">
            <Sliders className="h-4 w-4 text-slate-500" />
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              İşletme Tipi ve Modül Yönetimi
            </h3>
          </div>

          <div className="space-y-3">
            {/* İşletme Türü Seçimi */}
            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                İşletme Türü:
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {[
                  { id: "cafe", title: "Kahveci / Kafe" },
                  { id: "hookah_lounge", title: "Nargile Lounge" },
                  { id: "restaurant", title: "Restoran / Lokanta" },
                  { id: "bar", title: "Bar / Pub" },
                ].map((type) => (
                  <button
                    key={type.id}
                    type="button"
                    onClick={() => {
                      setBusinessType(type.id);
                      if (type.id === "hookah_lounge") {
                        setHookahMode(true);
                      }
                    }}
                    className={`py-2 px-2.5 rounded border text-xs font-medium transition-colors ${
                      businessType === type.id
                        ? "bg-slate-900 dark:bg-slate-800 border-slate-900 dark:border-slate-700 text-white"
                        : "bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-slate-400"
                    }`}
                  >
                    {type.title}
                  </button>
                ))}
              </div>
            </div>

            {/* MODÜL TOGGLE LİSTESİ */}
            <div className="divide-y divide-slate-100 dark:divide-slate-800 pt-1">
              {/* Sadece Görsel QR Menü Modu */}
              <div className="py-2.5 flex items-center justify-between gap-4">
                <div>
                  <h4 className="text-xs font-medium text-slate-900 dark:text-white">
                    Sadece Görsel Menü Modu (Katalog)
                  </h4>
                  <p className="text-[11px] text-slate-500">
                    Sepet ve sipariş butonlarını gizler, menüyü dijital katalog olarak sunar.
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={isCatalogOnly}
                  onChange={(e) => setIsCatalogOnly(e.target.checked)}
                  className="w-4 h-4 rounded accent-slate-900 dark:accent-amber-500 cursor-pointer"
                />
              </div>

              {/* Nargile Kafe Modu */}
              <div className="py-2.5 flex items-center justify-between gap-4">
                <div>
                  <h4 className="text-xs font-medium text-slate-900 dark:text-white">
                    Nargile Kafe Modu
                  </h4>
                  <p className="text-[11px] text-slate-500">
                    Müşteri ekranına Köz Yenile butonu ekler, KDS&apos;de nargile istasyonu ve 25 dakikalık köz sayacını aktif eder.
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={hookahMode}
                  onChange={(e) => setHookahMode(e.target.checked)}
                  className="w-4 h-4 rounded accent-slate-900 dark:accent-amber-500 cursor-pointer"
                />
              </div>

              {/* Garson Çağır Butonu */}
              <div className="py-2.5 flex items-center justify-between gap-4">
                <div>
                  <h4 className="text-xs font-medium text-slate-900 dark:text-white">
                    Garson Çağırma Modülü
                  </h4>
                  <p className="text-[11px] text-slate-500">
                    Müşterinin masasından garson çağırmasını sağlar.
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={enableWaiterCall}
                  onChange={(e) => setEnableWaiterCall(e.target.checked)}
                  className="w-4 h-4 rounded accent-slate-900 dark:accent-amber-500 cursor-pointer"
                />
              </div>

              {/* Hesap İsteme Modülü */}
              <div className="py-3.5 flex items-center justify-between gap-4">
                <div>
                  <h4 className="text-xs sm:text-sm font-bold text-stone-900 dark:text-stone-100">
                    Hesap İsteme & Ödeme Yöntemi Seçimi
                  </h4>
                  <p className="text-[11px] text-stone-500">
                    Müşterinin Nakit, Kart veya Alman Usulü seçerek hesap istemesini sağlar.
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={enableBillRequest}
                  onChange={(e) => setEnableBillRequest(e.target.checked)}
                  className="w-5 h-5 rounded accent-amber-600 cursor-pointer"
                />
              </div>

              {/* Hızlı Wi-Fi Kopyalama Barı */}
              <div className="py-3.5 flex items-center justify-between gap-4">
                <div>
                  <h4 className="text-xs sm:text-sm font-bold text-stone-900 dark:text-stone-100">
                    Menü Üstü Wi-Fi Kopyalama Barı
                  </h4>
                  <p className="text-[11px] text-stone-500">
                    Menü açıldığında müşterinin şifreyi tek tıkla kopyalamasını sağlayan pratik çubuk.
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={enableQuickWifiBar}
                  onChange={(e) => setEnableQuickWifiBar(e.target.checked)}
                  className="w-5 h-5 rounded accent-amber-600 cursor-pointer"
                />
              </div>

              {/* Hesap İsteyince Google Yorum Kartı */}
              <div className="py-3.5 flex items-center justify-between gap-4">
                <div>
                  <h4 className="text-xs sm:text-sm font-bold text-stone-900 dark:text-stone-100">
                    Hesap İstendiğinde Google Puan Kartı
                  </h4>
                  <p className="text-[11px] text-stone-500">
                    Müşteri hesap istediği anda &ldquo;Bizi Google&apos;da Puanlayın&rdquo; kartı göstererek yorum sayısını katlar.
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={enableGoogleReviewPrompt}
                  onChange={(e) => setEnableGoogleReviewPrompt(e.target.checked)}
                  className="w-5 h-5 rounded accent-amber-600 cursor-pointer"
                />
              </div>
            </div>
          </div>
        </div>

        {/* STANDART İŞLETME BİLGİLERİ */}
        <div className="rounded-lg bg-white dark:bg-slate-900 p-5 border border-slate-200 dark:border-slate-800 space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-200 dark:border-slate-800">
            <Coffee className="h-4 w-4 text-slate-500" />
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Temel Kafe Bilgileri
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-stone-600 dark:text-stone-400 block mb-1">
                İşletme Adı:
              </label>
              <input
                type="text"
                name="cafeName"
                defaultValue={settings.cafeName}
                required
                className="w-full rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-300 dark:border-stone-700 p-2.5 text-xs text-stone-900 dark:text-stone-100 font-bold"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-stone-600 dark:text-stone-400 block mb-1">
                Çalışma Saatleri:
              </label>
              <input
                type="text"
                name="workingHours"
                defaultValue={settings.workingHours || ""}
                className="w-full rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-300 dark:border-stone-700 p-2.5 text-xs text-stone-900 dark:text-stone-100"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-stone-600 dark:text-stone-400 block mb-1">
                Wi-Fi Adı (SSID):
              </label>
              <input
                type="text"
                name="wifiSsid"
                defaultValue={settings.wifiSsid || ""}
                className="w-full rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-300 dark:border-stone-700 p-2.5 text-xs text-stone-900 dark:text-stone-100"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-stone-600 dark:text-stone-400 block mb-1">
                Wi-Fi Şifresi:
              </label>
              <input
                type="text"
                name="wifiPassword"
                defaultValue={settings.wifiPassword || ""}
                className="w-full rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-300 dark:border-stone-700 p-2.5 text-xs text-stone-900 dark:text-stone-100 font-mono"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="text-xs font-semibold text-stone-600 dark:text-stone-400 block mb-1">
                Google Haritalar Puanlama URL:
              </label>
              <input
                type="url"
                name="googleReviewUrl"
                defaultValue={settings.googleReviewUrl || ""}
                placeholder="https://maps.google.com/?q=..."
                className="w-full rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-300 dark:border-stone-700 p-2.5 text-xs text-stone-900 dark:text-stone-100"
              />
            </div>
          </div>
        </div>

        {/* Hata & Kaydet Butonu */}
        {errorMsg && (
          <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-400 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4" />
            <span>{errorMsg}</span>
          </div>
        )}

        <div className="flex items-center justify-end gap-3 pt-2">
          {saved && (
            <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
              <Check className="w-4 h-4" />
              <span>Ayarlar Başarıyla Kaydedildi!</span>
            </span>
          )}

          <button
            type="submit"
            disabled={isSaving}
            className="py-2 px-4 rounded bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 dark:hover:bg-slate-700 text-white font-medium text-xs flex items-center gap-2 transition-colors disabled:opacity-50"
          >
            <Save className="w-3.5 h-3.5" />
            <span>{isSaving ? "Kaydediliyor..." : "Ayarları Kaydet"}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
