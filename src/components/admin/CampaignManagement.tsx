"use client";

import { useState } from "react";
import { Plus, Edit2, Trash2, Flame, CheckCircle, XCircle, Sparkles, Upload } from "lucide-react";
import { CampaignItem } from "@/lib/types";
import {
  addCampaignAction,
  updateCampaignAction,
  deleteCampaignAction,
  toggleCampaignStatusAction,
} from "@/actions/campaigns";

interface CampaignManagementProps {
  campaigns: CampaignItem[];
}

export default function CampaignManagement({ campaigns }: CampaignManagementProps) {
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCampaign, setEditingCampaign] = useState<CampaignItem | null>(null);
  const [imageUrlInput, setImageUrlInput] = useState("");
  const [isUploading, setIsUploading] = useState(false);

  const handleOpenAdd = () => {
    setEditingCampaign(null);
    setImageUrlInput("");
    setModalOpen(true);
  };

  const handleOpenEdit = (camp: CampaignItem) => {
    setEditingCampaign(camp);
    setImageUrlInput(camp.imageUrl || "");
    setModalOpen(true);
  };

  const handleDelete = async (id: string, title: string) => {
    if (confirm(`"${title}" kampanyasını silmek istediğinize emin misiniz?`)) {
      await deleteCampaignAction(id);
    }
  };

  const handleToggleStatus = async (id: string, currentStatus: boolean) => {
    await toggleCampaignStatusAction(id, currentStatus);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      const data = await res.json();
      if (data.url) setImageUrlInput(data.url);
    } catch {
      alert("Görsel yüklenemedi.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    formData.set("imageUrl", imageUrlInput);

    if (editingCampaign) {
      await updateCampaignAction(editingCampaign.id, formData);
    } else {
      await addCampaignAction(formData);
    }
    setModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Üst Başlık & Ekle Butonu */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold font-display text-stone-900 dark:text-stone-100 flex items-center gap-2">
            <Flame className="h-5 w-5 text-amber-500 fill-amber-500" />
            <span>Fırsat & Kampanya Yönetimi ({campaigns.length})</span>
          </h2>
          <p className="text-xs text-stone-500 dark:text-stone-400">
            QR menünün en tepesinde sergilenen ve ortalama sepet tutarını (AOV) artıran kampanya kartları.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="flex items-center gap-1.5 rounded-xl bg-amber-600 px-4 py-2 text-xs font-bold text-white shadow hover:bg-amber-700 active:scale-95 transition-all"
        >
          <Plus className="h-4 w-4" />
          <span>Yeni Kampanya Ekle</span>
        </button>
      </div>

      {/* Kampanya Kartları Listesi */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {campaigns.map((camp) => (
          <div
            key={camp.id}
            className="overflow-hidden rounded-2xl bg-white dark:bg-stone-900 border border-stone-200/80 dark:border-stone-800 shadow-sm flex flex-col justify-between"
          >
            {/* Görsel ve Rozet */}
            <div className="relative h-36 w-full bg-stone-100 dark:bg-stone-800 overflow-hidden">
              {camp.imageUrl ? (
                <img
                  src={camp.imageUrl}
                  alt={camp.title}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-stone-400">
                  <Sparkles className="h-8 w-8" />
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />

              {camp.badgeText && (
                <div className="absolute top-3 left-3">
                  <span className="rounded-full bg-amber-500 px-2.5 py-0.5 text-[10px] font-black uppercase text-stone-950 shadow">
                    {camp.badgeText}
                  </span>
                </div>
              )}

              <div className="absolute bottom-2 left-3 right-3 text-white">
                <p className="font-extrabold text-sm line-clamp-1">{camp.title}</p>
              </div>
            </div>

            {/* Bilgiler */}
            <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
              {camp.subtitle && (
                <p className="text-xs text-stone-600 dark:text-stone-300 line-clamp-2">
                  {camp.subtitle}
                </p>
              )}

              <div className="flex items-center justify-between border-t border-stone-100 dark:border-stone-800 pt-2 text-xs">
                <div>
                  {camp.discountedPrice ? (
                    <div className="flex items-baseline gap-1.5">
                      <span className="font-bold text-amber-700 dark:text-amber-400 text-sm">
                        ₺{camp.discountedPrice}
                      </span>
                      {camp.originalPrice && (
                        <span className="text-[11px] text-stone-400 line-through">
                          ₺{camp.originalPrice}
                        </span>
                      )}
                    </div>
                  ) : (
                    <span className="font-semibold text-stone-400">Özel Menü Fırsatı</span>
                  )}
                </div>

                {/* Durum Butonu */}
                <button
                  onClick={() => handleToggleStatus(camp.id, camp.isActive)}
                  className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                    camp.isActive
                      ? "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800"
                      : "bg-stone-100 dark:bg-stone-800 text-stone-500 border border-stone-300 dark:border-stone-700"
                  }`}
                >
                  {camp.isActive ? (
                    <>
                      <CheckCircle className="h-3 w-3" />
                      <span>Aktif</span>
                    </>
                  ) : (
                    <>
                      <XCircle className="h-3 w-3" />
                      <span>Pasif</span>
                    </>
                  )}
                </button>
              </div>

              {/* İşlemler */}
              <div className="flex items-center justify-end gap-1.5 border-t border-stone-100 dark:border-stone-800 pt-2">
                <button
                  onClick={() => handleOpenEdit(camp)}
                  className="rounded-lg p-1.5 text-stone-500 hover:bg-stone-100 dark:hover:bg-stone-800"
                  title="Düzenle"
                >
                  <Edit2 className="h-4 w-4" />
                </button>
                <button
                  onClick={() => handleDelete(camp.id, camp.title)}
                  className="rounded-lg p-1.5 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/50"
                  title="Sil"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Kampanya Ekle / Düzenle Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="relative w-full max-w-lg rounded-3xl bg-white dark:bg-stone-900 p-6 shadow-2xl border border-stone-200 dark:border-stone-800 max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-bold font-display text-stone-900 dark:text-stone-100">
              {editingCampaign ? "Kampanyayı Düzenle" : "Yeni Kampanya Oluştur"}
            </h3>

            <form onSubmit={handleSubmit} className="mt-4 space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-stone-700 dark:text-stone-300 mb-1">
                  Kampanya Başlığı *
                </label>
                <input
                  type="text"
                  name="title"
                  required
                  defaultValue={editingCampaign?.title || ""}
                  placeholder="Örn: Latte + Brownie Menüsü"
                  className="w-full rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 p-2.5 text-stone-900 dark:text-stone-100 focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-stone-700 dark:text-stone-300 mb-1">
                  Alt Başlık / Kampanya Açıklaması
                </label>
                <input
                  type="text"
                  name="subtitle"
                  defaultValue={editingCampaign?.subtitle || ""}
                  placeholder="Örn: 190 TL yerine sadece 150 TL"
                  className="w-full rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 p-2.5 text-stone-900 dark:text-stone-100 focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-stone-700 dark:text-stone-300 mb-1">
                    Rozet Metni
                  </label>
                  <input
                    type="text"
                    name="badgeText"
                    defaultValue={editingCampaign?.badgeText || "GÜNÜN FIRSATI"}
                    placeholder="GÜNÜN FIRSATI"
                    className="w-full rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 p-2.5 text-stone-900 dark:text-stone-100 focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-stone-700 dark:text-stone-300 mb-1">
                    Normal Fiyat (₺)
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    name="originalPrice"
                    defaultValue={editingCampaign?.originalPrice || ""}
                    placeholder="190"
                    className="w-full rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 p-2.5 text-stone-900 dark:text-stone-100 focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-stone-700 dark:text-stone-300 mb-1">
                    Fırsat Fiyatı (₺)
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    name="discountedPrice"
                    defaultValue={editingCampaign?.discountedPrice || ""}
                    placeholder="150"
                    className="w-full rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 p-2.5 text-stone-900 dark:text-stone-100 focus:ring-2 focus:ring-amber-500"
                  />
                </div>
              </div>

              {/* Görsel */}
              <div>
                <label className="block font-semibold text-stone-700 dark:text-stone-300 mb-1">
                  Görsel (URL veya Cihazdan Seçin)
                </label>
                <div className="flex gap-2">
                  <input
                    type="url"
                    value={imageUrlInput}
                    onChange={(e) => setImageUrlInput(e.target.value)}
                    placeholder="https://..."
                    className="flex-1 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 p-2 text-stone-900 dark:text-stone-100 focus:ring-2 focus:ring-amber-500"
                  />
                  <label className="cursor-pointer flex items-center gap-1 rounded-xl bg-stone-100 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 px-3 py-2 text-stone-600 dark:text-stone-300 hover:bg-stone-200">
                    <Upload className="h-4 w-4" />
                    <span>{isUploading ? "..." : "Yükle"}</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileUpload}
                      className="hidden"
                      disabled={isUploading}
                    />
                  </label>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="campActive"
                  name="isActive"
                  defaultChecked={editingCampaign ? editingCampaign.isActive : true}
                  className="h-4 w-4 rounded text-amber-600 focus:ring-amber-500"
                />
                <label htmlFor="campActive" className="font-semibold text-stone-700 dark:text-stone-300">
                  Kampanya Menüde Yayında Olsun (Aktif)
                </label>
              </div>

              <div className="mt-6 flex justify-end gap-2 border-t border-stone-200 dark:border-stone-800 pt-4">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="rounded-xl px-4 py-2 font-semibold text-stone-500 hover:bg-stone-100"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-amber-600 px-5 py-2 font-bold text-white shadow hover:bg-amber-700"
                >
                  Kaydet
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
