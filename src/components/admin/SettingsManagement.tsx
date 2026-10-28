"use client";

import { useState } from "react";
import { Save, Check, Coffee, Wifi, Share2, MapPin, Star, Upload } from "lucide-react";
import { BusinessSettingsData } from "@/lib/types";
import { updateBusinessSettingsAction } from "@/actions/settings";

interface SettingsManagementProps {
  settings: BusinessSettingsData;
}

export default function SettingsManagement({ settings }: SettingsManagementProps) {
  const [saved, setSaved] = useState(false);
  const [logoInput, setLogoInput] = useState(settings.logoUrl || "");
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);

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
    const formData = new FormData(e.currentTarget);
    formData.set("logoUrl", logoInput);

    await updateBusinessSettingsAction(formData);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold font-display text-stone-900 dark:text-stone-100">
          İşletme & Entegrasyon Ayarları
        </h2>
        <p className="text-xs text-stone-500 dark:text-stone-400">
          Kafe bilgileri, misafir Wi-Fi ağı, sosyal medya hesapları ve Google yorum linkinizi güncelleyin.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* 1. KAFE KİMLİĞİ */}
        <div className="rounded-2xl bg-white dark:bg-stone-900 p-6 border border-stone-200/80 dark:border-stone-800 shadow-sm space-y-4">
          <div className="flex items-center gap-2 text-sm font-bold text-stone-900 dark:text-stone-100">
            <Coffee className="h-4 w-4 text-amber-600" />
            <span>Kafe Kimliği</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-semibold text-stone-700 dark:text-stone-300 mb-1">
                Kafe Adı *
              </label>
              <input
                type="text"
                name="cafeName"
                required
                defaultValue={settings.cafeName}
                placeholder="Örn: Gloriouss Café"
                className="w-full rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 p-2.5 text-stone-900 dark:text-stone-100 focus:ring-2 focus:ring-amber-500"
              />
            </div>

            <div>
              <label className="block font-semibold text-stone-700 dark:text-stone-300 mb-1">
                Çalışma Saatleri
              </label>
              <input
                type="text"
                name="workingHours"
                defaultValue={settings.workingHours || ""}
                placeholder="Her gün: 09:00 - 02:00"
                className="w-full rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 p-2.5 text-stone-900 dark:text-stone-100 focus:ring-2 focus:ring-amber-500"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block font-semibold text-stone-700 dark:text-stone-300 mb-1">
                Logo Görseli (URL veya Cihazdan Yükle)
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={logoInput}
                  onChange={(e) => setLogoInput(e.target.value)}
                  placeholder="https://... veya /images/logo.png"
                  className="flex-1 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 p-2 text-stone-900 dark:text-stone-100 focus:ring-2 focus:ring-amber-500"
                />
                <label className="cursor-pointer flex items-center gap-1 rounded-xl bg-stone-100 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 px-3 py-2 text-stone-600 dark:text-stone-300 hover:bg-stone-200">
                  <Upload className="h-4 w-4" />
                  <span>{isUploadingLogo ? "Yükleniyor..." : "Yükle"}</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleLogoUpload}
                    className="hidden"
                    disabled={isUploadingLogo}
                  />
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* 2. MİSAFİR WI-FI AĞI */}
        <div className="rounded-2xl bg-white dark:bg-stone-900 p-6 border border-stone-200/80 dark:border-stone-800 shadow-sm space-y-4">
          <div className="flex items-center gap-2 text-sm font-bold text-stone-900 dark:text-stone-100">
            <Wifi className="h-4 w-4 text-amber-600" />
            <span>Misafir Wi-Fi Bilgileri</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-semibold text-stone-700 dark:text-stone-300 mb-1">
                Wi-Fi Ağ Adı (SSID)
              </label>
              <input
                type="text"
                name="wifiSsid"
                defaultValue={settings.wifiSsid || ""}
                placeholder="Kafe_Misafir_Wifi"
                className="w-full rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 p-2.5 text-stone-900 dark:text-stone-100 focus:ring-2 focus:ring-amber-500"
              />
            </div>

            <div>
              <label className="block font-semibold text-stone-700 dark:text-stone-300 mb-1">
                Wi-Fi Şifresi
              </label>
              <input
                type="text"
                name="wifiPassword"
                defaultValue={settings.wifiPassword || ""}
                placeholder="Kahve2026!"
                className="w-full rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 p-2.5 text-stone-900 dark:text-stone-100 focus:ring-2 focus:ring-amber-500"
              />
            </div>
          </div>
        </div>

        {/* 3. İLETİŞİM & SOSYAL MEDYA */}
        <div className="rounded-2xl bg-white dark:bg-stone-900 p-6 border border-stone-200/80 dark:border-stone-800 shadow-sm space-y-4">
          <div className="flex items-center gap-2 text-sm font-bold text-stone-900 dark:text-stone-100">
            <Share2 className="h-4 w-4 text-amber-600" />
            <span>Sosyal Medya & İletişim Entegrasyonları</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-semibold text-stone-700 dark:text-stone-300 mb-1">
                Instagram URL
              </label>
              <input
                type="url"
                name="instagramUrl"
                defaultValue={settings.instagramUrl || ""}
                placeholder="https://instagram.com/kafeadi"
                className="w-full rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 p-2.5 text-stone-900 dark:text-stone-100 focus:ring-2 focus:ring-amber-500"
              />
            </div>

            <div>
              <label className="block font-semibold text-stone-700 dark:text-stone-300 mb-1">
                TikTok URL
              </label>
              <input
                type="url"
                name="tiktokUrl"
                defaultValue={settings.tiktokUrl || ""}
                placeholder="https://tiktok.com/@kafeadi"
                className="w-full rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 p-2.5 text-stone-900 dark:text-stone-100 focus:ring-2 focus:ring-amber-500"
              />
            </div>

            <div>
              <label className="block font-semibold text-stone-700 dark:text-stone-300 mb-1">
                WhatsApp Sipariş / Destek Numarası
              </label>
              <input
                type="text"
                name="whatsappNumber"
                defaultValue={settings.whatsappNumber || ""}
                placeholder="905551234567"
                className="w-full rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 p-2.5 text-stone-900 dark:text-stone-100 focus:ring-2 focus:ring-amber-500"
              />
            </div>

            <div>
              <label className="block font-semibold text-stone-700 dark:text-stone-300 mb-1">
                Telefon Numarası (Arama İçin)
              </label>
              <input
                type="text"
                name="phone"
                defaultValue={settings.phone || ""}
                placeholder="+90 216 450 12 34"
                className="w-full rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 p-2.5 text-stone-900 dark:text-stone-100 focus:ring-2 focus:ring-amber-500"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block font-semibold text-stone-700 dark:text-stone-300 mb-1">
                Google Maps Yorum Linki (⭐ 5 Yıldız Yönlendirmesi)
              </label>
              <input
                type="url"
                name="googleReviewUrl"
                defaultValue={settings.googleReviewUrl || ""}
                placeholder="https://maps.app.goo.gl/..."
                className="w-full rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 p-2.5 text-stone-900 dark:text-stone-100 focus:ring-2 focus:ring-amber-500"
              />
              <p className="mt-1 text-[11px] text-stone-400">
                Google Haritalar işletme profilinizdeki &quot;Yorum iste&quot; linkini buraya yapıştırın.
              </p>
            </div>

            <div className="sm:col-span-2">
              <label className="block font-semibold text-stone-700 dark:text-stone-300 mb-1">
                Açık Adres
              </label>
              <input
                type="text"
                name="address"
                defaultValue={settings.address || ""}
                placeholder="Moda Caddesi No:42, Kadıköy, İstanbul"
                className="w-full rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 p-2.5 text-stone-900 dark:text-stone-100 focus:ring-2 focus:ring-amber-500"
              />
            </div>
          </div>
        </div>

        {/* Kaydet Butonu */}
        <div className="flex items-center justify-end gap-3">
          {saved && (
            <span className="flex items-center gap-1 text-xs font-semibold text-emerald-600">
              <Check className="h-4 w-4" />
              Tüm ayarlar başarıyla kaydedildi!
            </span>
          )}
          <button
            type="submit"
            className="flex items-center gap-2 rounded-2xl bg-amber-600 px-6 py-3 text-xs font-bold text-white shadow-lg shadow-amber-600/20 hover:bg-amber-700 active:scale-95 transition-all"
          >
            <Save className="h-4 w-4" />
            <span>Ayarları Güncelle</span>
          </button>
        </div>
      </form>
    </div>
  );
}
