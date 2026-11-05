"use client";

import { useState } from "react";
import { Plus, Edit2, Trash2, Tag, CheckCircle, XCircle, Image as ImageIcon, Upload } from "lucide-react";
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
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const handleOpenAdd = () => {
    setEditingCampaign(null);
    setImageUrlInput("");
    setFormError(null);
    setModalOpen(true);
  };

  const handleOpenEdit = (camp: CampaignItem) => {
    setEditingCampaign(camp);
    setImageUrlInput(camp.imageUrl || "");
    setFormError(null);
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
    setIsSubmitting(true);
    setFormError(null);

    const formData = new FormData(e.currentTarget);
    formData.set("imageUrl", imageUrlInput);

    try {
      let res;
      if (editingCampaign) {
        res = await updateCampaignAction(editingCampaign.id, formData);
      } else {
        res = await addCampaignAction(formData);
      }

      if (res && !res.success) {
        setFormError(res.error || "Kampanya kaydedilirken bir hata oluştu.");
        setIsSubmitting(false);
        return;
      }

      setModalOpen(false);
    } catch (err: any) {
      setFormError(err.message || "İşlem sırasında bir hata oluştu.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Üst Başlık & Ekle Butonu */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Tag className="h-5 w-5 text-amber-500" />
            <span>Fırsat & Kampanya Yönetimi ({campaigns.length})</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            QR menünün üst kısmında yer alan kampanya ve teklif kartları.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="flex items-center gap-1.5 rounded-md bg-amber-600 px-3.5 py-2 text-xs font-semibold text-white hover:bg-amber-500 transition-colors cursor-pointer"
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
            className="overflow-hidden rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between"
          >
            {/* Görsel ve Rozet */}
            <div className="relative h-36 w-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
              {camp.imageUrl ? (
                <img
                  src={camp.imageUrl}
                  alt={camp.title}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-slate-400">
                  <ImageIcon className="h-8 w-8 stroke-[1.5]" />
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />

              {camp.badgeText && (
                <div className="absolute top-2.5 left-2.5">
                  <span className="rounded bg-amber-600 px-2 py-0.5 text-[10px] font-bold uppercase text-white">
                    {camp.badgeText}
                  </span>
                </div>
              )}

              <div className="absolute bottom-2 left-3 right-3 text-white">
                <p className="font-bold text-sm line-clamp-1">{camp.title}</p>
              </div>
            </div>

            {/* Bilgiler */}
            <div className="p-3.5 space-y-3 flex-1 flex flex-col justify-between">
              {camp.subtitle && (
                <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2">
                  {camp.subtitle}
                </p>
              )}

              <div className="flex items-center justify-between border-t border-slate-100 dark:border-slate-800 pt-2 text-xs">
                <div>
                  {camp.discountedPrice ? (
                    <div className="flex items-baseline gap-1.5 tabular-nums">
                      <span className="font-bold text-amber-600 dark:text-amber-400 text-sm">
                        ₺{camp.discountedPrice}
                      </span>
                      {camp.originalPrice && (
                        <span className="text-[11px] text-slate-400 line-through">
                          ₺{camp.originalPrice}
                        </span>
                      )}
                    </div>
                  ) : (
                    <span className="font-medium text-slate-400">Özel Menü Fırsatı</span>
                  )}
                </div>

                {/* Durum Butonu */}
                <button
                  onClick={() => handleToggleStatus(camp.id, camp.isActive)}
                  className={`inline-flex items-center gap-1 rounded px-2 py-0.5 text-[10px] font-semibold ${
                    camp.isActive
                      ? "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800"
                      : "bg-slate-100 dark:bg-slate-800 text-slate-500 border border-slate-300 dark:border-slate-700"
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
              <div className="flex items-center justify-end gap-1.5 border-t border-slate-100 dark:border-slate-800 pt-2">
                <button
                  onClick={() => handleOpenEdit(camp)}
                  className="rounded p-1.5 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
                  title="Düzenle"
                >
                  <Edit2 className="h-4 w-4" />
                </button>
                <button
                  onClick={() => handleDelete(camp.id, camp.title)}
                  className="rounded p-1.5 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/50"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60">
          <div className="relative w-full max-w-lg rounded-lg bg-white dark:bg-slate-900 p-5 border border-slate-200 dark:border-slate-800 max-h-[90vh] overflow-y-auto">
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
              {editingCampaign ? "Kampanyayı Düzenle" : "Yeni Kampanya Oluştur"}
            </h3>

            {formError && (
              <div className="mt-3 p-2.5 rounded bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/40 text-rose-600 dark:text-rose-400 text-xs font-medium">
                {formError}
              </div>
            )}

            <form onSubmit={handleSubmit} className="mt-4 space-y-4 text-xs">
              <div>
                <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Kampanya Başlığı *
                </label>
                <input
                  type="text"
                  name="title"
                  required
                  defaultValue={editingCampaign?.title || ""}
                  placeholder="Örn: Latte + Brownie Menüsü"
                  className="w-full rounded-md bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-2 text-slate-900 dark:text-slate-100 focus:ring-1 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Alt Başlık / Kampanya Açıklaması
                </label>
                <input
                  type="text"
                  name="subtitle"
                  defaultValue={editingCampaign?.subtitle || ""}
                  placeholder="Örn: 190 TL yerine sadece 150 TL"
                  className="w-full rounded-md bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-2 text-slate-900 dark:text-slate-100 focus:ring-1 focus:ring-amber-500"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Rozet Metni
                  </label>
                  <input
                    type="text"
                    name="badgeText"
                    defaultValue={editingCampaign?.badgeText || "GÜNÜN FIRSATI"}
                    placeholder="GÜNÜN FIRSATI"
                    className="w-full rounded-md bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-2 text-slate-900 dark:text-slate-100 focus:ring-1 focus:ring-amber-500"
                  />
                </div>

                <div>
                  <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Normal Fiyat (₺)
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    name="originalPrice"
                    defaultValue={editingCampaign?.originalPrice || ""}
                    placeholder="190"
                    className="w-full rounded-md bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-2 tabular-nums text-slate-900 dark:text-slate-100 focus:ring-1 focus:ring-amber-500"
                  />
                </div>

                <div>
                  <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Fırsat Fiyatı (₺)
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    name="discountedPrice"
                    defaultValue={editingCampaign?.discountedPrice || ""}
                    placeholder="150"
                    className="w-full rounded-md bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-2 tabular-nums text-slate-900 dark:text-slate-100 focus:ring-1 focus:ring-amber-500"
                  />
                </div>
              </div>

              {/* Görsel */}
              <div>
                <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Görsel (URL veya Cihazdan Seçin)
                </label>
                <div className="flex gap-2">
                  <input
                    type="url"
                    value={imageUrlInput}
                    onChange={(e) => setImageUrlInput(e.target.value)}
                    placeholder="https://..."
                    className="flex-1 rounded-md bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-2 text-slate-900 dark:text-slate-100 focus:ring-1 focus:ring-amber-500"
                  />
                  <label className="cursor-pointer flex items-center gap-1 rounded-md bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-3 py-2 text-slate-600 dark:text-slate-300 hover:bg-slate-200 transition-colors">
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
                <label htmlFor="campActive" className="font-medium text-slate-700 dark:text-slate-300">
                  Kampanya Menüde Yayında Olsun (Aktif)
                </label>
              </div>

              <div className="mt-5 flex justify-end gap-2 border-t border-slate-200 dark:border-slate-800 pt-3">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="rounded-md px-3.5 py-2 font-medium text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="rounded-md bg-amber-600 px-4 py-2 font-semibold text-white hover:bg-amber-500 disabled:opacity-50 transition-colors cursor-pointer"
                >
                  {isSubmitting ? "Kaydediliyor..." : "Kaydet"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
