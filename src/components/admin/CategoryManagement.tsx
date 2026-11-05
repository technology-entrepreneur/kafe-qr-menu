"use client";

import { useState } from "react";
import { Plus, Trash2, Edit2, Layers, CheckCircle, XCircle } from "lucide-react";
import { CategoryItem } from "@/lib/types";
import {
  addCategoryAction,
  updateCategoryAction,
  deleteCategoryAction,
  toggleCategoryStatusAction,
} from "@/actions/categories";

interface CategoryManagementProps {
  categories: CategoryItem[];
}

export default function CategoryManagement({ categories }: CategoryManagementProps) {
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<CategoryItem | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const handleOpenAdd = () => {
    setEditingCategory(null);
    setFormError(null);
    setModalOpen(true);
  };

  const handleOpenEdit = (cat: CategoryItem) => {
    setEditingCategory(cat);
    setFormError(null);
    setModalOpen(true);
  };

  const handleDelete = async (id: string, name: string) => {
    if (confirm(`"${name}" kategorisini ve altındaki tüm ürünleri silmek istediğinize emin misiniz?`)) {
      await deleteCategoryAction(id);
    }
  };

  const handleToggleStatus = async (id: string, currentStatus: boolean) => {
    await toggleCategoryStatusAction(id, currentStatus);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setFormError(null);

    const formData = new FormData(e.currentTarget);

    try {
      let res;
      if (editingCategory) {
        res = await updateCategoryAction(editingCategory.id, formData);
      } else {
        res = await addCategoryAction(formData);
      }

      if (res && !res.success) {
        setFormError(res.error || "Kategori kaydedilirken bir hata oluştu.");
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
      {/* Başlık ve Ekle Butonu */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold font-display text-stone-900 dark:text-stone-100">
            Kategori Yönetimi ({categories.length})
          </h2>
          <p className="text-xs text-stone-500 dark:text-stone-400">
            Menü bölümlerini düzenleyin, sıralamasını belirleyin veya geçici olarak gizleyin.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="flex items-center gap-1.5 rounded-xl bg-amber-600 px-4 py-2 text-xs font-bold text-white shadow hover:bg-amber-700 active:scale-95 transition-all"
        >
          <Plus className="h-4 w-4" />
          <span>Yeni Kategori</span>
        </button>
      </div>

      {/* Kategori Kartları / Tablosu */}
      <div className="overflow-hidden rounded-2xl bg-white dark:bg-stone-900 border border-stone-200/80 dark:border-stone-800 shadow-sm">
        <table className="w-full text-left text-xs">
          <thead className="bg-stone-50 dark:bg-stone-800/60 text-stone-500 dark:text-stone-400 uppercase tracking-wider font-semibold border-b border-stone-200 dark:border-stone-800">
            <tr>
              <th className="px-4 py-3">Sıra</th>
              <th className="px-4 py-3">Kategori Adı</th>
              <th className="px-4 py-3">Ürün Sayısı</th>
              <th className="px-4 py-3">Menü Görünürlüğü</th>
              <th className="px-4 py-3 text-right">İşlemler</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-100 dark:divide-stone-800/80">
            {categories.map((cat) => (
              <tr key={cat.id} className="hover:bg-stone-50/50 dark:hover:bg-stone-800/40">
                <td className="px-4 py-3 font-mono font-bold text-stone-400 w-12">
                  #{cat.order}
                </td>
                <td className="px-4 py-3 font-bold text-stone-900 dark:text-stone-100 text-sm">
                  <div className="flex items-center gap-2">
                    <Layers className="h-4 w-4 text-amber-600" />
                    <span>{cat.name}</span>
                  </div>
                </td>
                <td className="px-4 py-3 text-stone-500">
                  {cat.products?.length || 0} Ürün
                </td>
                <td className="px-4 py-3">
                  <button
                    onClick={() => handleToggleStatus(cat.id, cat.isActive)}
                    className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-semibold transition-all ${
                      cat.isActive
                        ? "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800"
                        : "bg-stone-100 dark:bg-stone-800 text-stone-500 border border-stone-300 dark:border-stone-700"
                    }`}
                  >
                    {cat.isActive ? (
                      <>
                        <CheckCircle className="h-3 w-3" />
                        <span>Menüde Aktif</span>
                      </>
                    ) : (
                      <>
                        <XCircle className="h-3 w-3" />
                        <span>Gizli / Pasif</span>
                      </>
                    )}
                  </button>
                </td>
                <td className="px-4 py-3 text-right">
                  <div className="flex items-center justify-end gap-1.5">
                    <button
                      onClick={() => handleOpenEdit(cat)}
                      className="rounded-lg p-1.5 text-stone-500 hover:bg-stone-100 hover:text-stone-800 dark:hover:bg-stone-800 dark:hover:text-stone-200"
                      title="Düzenle"
                    >
                      <Edit2 className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(cat.id, cat.name)}
                      className="rounded-lg p-1.5 text-rose-500 hover:bg-rose-50 hover:text-rose-700 dark:hover:bg-rose-950/50"
                      title="Sil"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60">
          <div className="w-full max-w-sm rounded-lg bg-white dark:bg-slate-900 p-5 border border-slate-200 dark:border-slate-800">
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
              {editingCategory ? "Kategoriyi Düzenle" : "Yeni Kategori Ekle"}
            </h3>

            {formError && (
              <div className="mt-3 p-2.5 rounded bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/40 text-rose-600 dark:text-rose-400 text-xs font-medium">
                {formError}
              </div>
            )}

            <form onSubmit={handleSubmit} className="mt-4 space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-stone-700 dark:text-stone-300 mb-1">
                  Kategori Adı (Türkçe) *
                </label>
                <input
                  type="text"
                  name="name"
                  required
                  defaultValue={editingCategory?.name || ""}
                  placeholder="Örn: Sıcak Kahveler"
                  className="w-full rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 p-2.5 text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-stone-700 dark:text-stone-300 mb-1">
                  Kategori Adı (İngilizce - EN)
                </label>
                <input
                  type="text"
                  name="nameEn"
                  defaultValue={editingCategory?.nameEn || ""}
                  placeholder="Örn: Specialty Hot Coffees"
                  className="w-full rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 p-2.5 text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-stone-700 dark:text-stone-300 mb-1">
                  Kategori İkonu / Emoji
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    name="icon"
                    defaultValue={editingCategory?.icon || "☕"}
                    placeholder="☕"
                    className="w-20 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 p-2.5 text-center text-base focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {["☕", "🧊", "🥐", "🍵", "🥪", "🍰", "🧃"].map((emo) => (
                      <button
                        key={emo}
                        type="button"
                        onClick={(e) => {
                          const form = e.currentTarget.closest("form");
                          const input = form?.querySelector<HTMLInputElement>('input[name="icon"]');
                          if (input) input.value = emo;
                        }}
                        className="w-8 h-8 rounded-lg bg-stone-100 dark:bg-stone-800 hover:bg-amber-500/20 text-sm flex items-center justify-center transition-colors"
                      >
                        {emo}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-stone-700 dark:text-stone-300 mb-1">
                  Sıralama Numarası (Order)
                </label>
                <input
                  type="number"
                  name="order"
                  defaultValue={editingCategory?.order || categories.length + 1}
                  className="w-full rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 p-2.5 text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="catActive"
                  name="isActive"
                  defaultChecked={editingCategory ? editingCategory.isActive : true}
                  className="h-4 w-4 rounded text-amber-600 focus:ring-amber-500"
                />
                <label htmlFor="catActive" className="font-semibold text-stone-700 dark:text-stone-300">
                  Kategori Menüde Görünsün (Aktif)
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
                  disabled={isSubmitting}
                  className="rounded-xl bg-amber-600 px-5 py-2 font-bold text-white shadow hover:bg-amber-700 disabled:opacity-50"
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
