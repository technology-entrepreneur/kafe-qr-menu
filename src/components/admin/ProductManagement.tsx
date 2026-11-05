"use client";

import { useState } from "react";
import { Plus, Edit2, Trash2, CheckCircle2, XCircle, Sparkles, Image as ImageIcon, Upload, Flame } from "lucide-react";
import { ProductItem, CategoryItem } from "@/lib/types";
import ProductCrossSellModal from "./ProductCrossSellModal";
import {
  addProductAction,
  updateProductAction,
  deleteProductAction,
  toggleProductStockAction,
} from "@/actions/products";

interface ProductManagementProps {
  products: ProductItem[];
  categories: CategoryItem[];
}

export default function ProductManagement({
  products,
  categories,
}: ProductManagementProps) {
  const [modalOpen, setModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<ProductItem | null>(null);
  const [crossSellProduct, setCrossSellProduct] = useState<ProductItem | null>(null);
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>("ALL");
  const [isUploading, setIsUploading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [imageUrlInput, setImageUrlInput] = useState("");

  // Filtreleme
  const filteredProducts = products.filter((p) =>
    selectedCategoryFilter === "ALL" ? true : p.categoryId === selectedCategoryFilter
  );

  const handleOpenAddModal = () => {
    setEditingProduct(null);
    setImageUrlInput("");
    setFormError(null);
    setModalOpen(true);
  };

  const handleOpenEditModal = (product: ProductItem) => {
    setEditingProduct(product);
    setImageUrlInput(product.imageUrl || "");
    setFormError(null);
    setModalOpen(true);
  };

  // Stok Durumu Hızlı Değiştirici
  const handleToggleStock = async (id: string) => {
    await toggleProductStockAction(id);
  };

  // Silme İşlemi
  const handleDelete = async (id: string) => {
    if (confirm("Bu ürünü silmek istediğinize emin misiniz?")) {
      await deleteProductAction(id);
    }
  };

  // Dosya Yükleme İşleyicisi
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (data.url) {
        setImageUrlInput(data.url);
      }
    } catch (err) {
      alert("Görsel yüklenirken hata oluştu.");
    } finally {
      setIsUploading(false);
    }
  };

  // Form Gönderme
  const handleFormSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setFormError(null);

    const formData = new FormData(e.currentTarget);
    formData.set("imageUrl", imageUrlInput);

    try {
      let res;
      if (editingProduct) {
        res = await updateProductAction(editingProduct.id, formData);
      } else {
        res = await addProductAction(formData);
      }

      if (res && !res.success) {
        setFormError(res.error || "Ürün kaydedilirken bir hata oluştu.");
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
      {/* Üst Bar: Başlık, Filtre ve Ekle Butonu */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold font-display text-stone-900 dark:text-stone-100">
            Ürün Yönetimi ({products.length})
          </h2>
          <p className="text-xs text-stone-500 dark:text-stone-400">
            Menüdeki ürünlerinizi ekleyin, fiyatlarını ve anlık stok durumlarını yönetin.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Kategori Filtresi */}
          <select
            value={selectedCategoryFilter}
            onChange={(e) => setSelectedCategoryFilter(e.target.value)}
            className="rounded-xl bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 px-3 py-2 text-xs font-semibold text-stone-700 dark:text-stone-200 focus:outline-none focus:ring-2 focus:ring-amber-500"
          >
            <option value="ALL">Tüm Kategoriler</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>

          {/* Yeni Ürün Butonu */}
          <button
            onClick={handleOpenAddModal}
            className="flex items-center gap-1.5 rounded-xl bg-amber-600 px-4 py-2 text-xs font-bold text-white shadow hover:bg-amber-700 active:scale-95 transition-all"
          >
            <Plus className="h-4 w-4" />
            <span>Yeni Ürün Ekle</span>
          </button>
        </div>
      </div>

      {/* Ürünler Tablosu / Listesi */}
      <div className="overflow-hidden rounded-2xl bg-white dark:bg-stone-900 border border-stone-200/80 dark:border-stone-800 shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-stone-50 dark:bg-stone-800/60 text-stone-500 dark:text-stone-400 uppercase tracking-wider font-semibold border-b border-stone-200 dark:border-stone-800">
              <tr>
                <th className="px-4 py-3">Ürün</th>
                <th className="px-4 py-3">Kategori</th>
                <th className="px-4 py-3">Fiyat</th>
                <th className="px-4 py-3">Stok Durumu</th>
                <th className="px-4 py-3 text-right">İşlemler</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 dark:divide-stone-800/80">
              {filteredProducts.map((product) => {
                const category = categories.find((c) => c.id === product.categoryId);
                return (
                  <tr key={product.id} className="hover:bg-stone-50/50 dark:hover:bg-stone-800/40 transition-colors">
                    {/* Ürün Bilgisi */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="relative h-12 w-12 flex-shrink-0 overflow-hidden rounded-xl bg-stone-100 dark:bg-stone-800 border border-stone-200 dark:border-stone-700">
                          {product.imageUrl ? (
                            <img
                              src={product.imageUrl}
                              alt={product.name}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center text-stone-400">
                              <Sparkles className="h-5 w-5" />
                            </div>
                          )}
                        </div>
                        <div>
                          <p className="font-bold text-stone-900 dark:text-stone-100 text-sm">
                            {product.name}
                          </p>
                          <p className="text-[11px] text-stone-500 line-clamp-1 max-w-xs">
                            {product.description || "Açıklama yok"}
                          </p>
                          {product.allergens && (
                            <span className="text-[10px] text-amber-700 dark:text-amber-400">
                              Alerjen: {product.allergens}
                            </span>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Kategori */}
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className="rounded-lg bg-stone-100 dark:bg-stone-800 px-2 py-1 text-[11px] font-medium text-stone-700 dark:text-stone-300">
                        {category?.name || "Kategorisiz"}
                      </span>
                    </td>

                    {/* Fiyat */}
                    <td className="px-4 py-3 whitespace-nowrap font-bold text-amber-800 dark:text-amber-400 text-sm">
                      ₺{product.price.toFixed(0)}
                    </td>

                    {/* Stok Hızlı Toggle */}
                    <td className="px-4 py-3 whitespace-nowrap">
                      <button
                        onClick={() => handleToggleStock(product.id)}
                        className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold transition-all ${
                          product.isAvailable
                            ? "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900/50 hover:bg-emerald-100"
                            : "bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-900/50 hover:bg-rose-100"
                        }`}
                        title="Tıklayarak stok durumunu değiştirin"
                      >
                        {product.isAvailable ? (
                          <>
                            <CheckCircle2 className="h-3.5 w-3.5" />
                            <span>Stokta Var</span>
                          </>
                        ) : (
                          <>
                            <XCircle className="h-3.5 w-3.5" />
                            <span>Tükendi</span>
                          </>
                        )}
                      </button>
                    </td>

                    {/* İşlemler */}
                    <td className="px-4 py-3 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => setCrossSellProduct(product)}
                          className="flex items-center gap-1 rounded-lg bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-400 border border-amber-200 dark:border-amber-800 px-2.5 py-1 text-[11px] font-semibold hover:bg-amber-100 dark:hover:bg-amber-900/40 transition-colors mr-1"
                          title="Çapraz Satış Önerileri ve Ekstraları Yönet"
                        >
                          <Flame className="h-3 w-3 text-amber-600 fill-amber-600" />
                          <span>Öneriler & Ekstralar ({product.suggestions?.length || 0})</span>
                        </button>
                        <button
                          onClick={() => handleOpenEditModal(product)}
                          className="rounded-lg p-1.5 text-stone-500 hover:bg-stone-100 hover:text-stone-800 dark:hover:bg-stone-800 dark:hover:text-stone-200 transition-colors"
                          title="Düzenle"
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(product.id)}
                          className="rounded-lg p-1.5 text-rose-500 hover:bg-rose-50 hover:text-rose-700 dark:hover:bg-rose-950/50 transition-colors"
                          title="Sil"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Ürün Ekle / Düzenle Modal Formu */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60">
          <div className="relative w-full max-w-lg rounded-lg bg-white dark:bg-slate-900 p-5 border border-slate-200 dark:border-slate-800 max-h-[90vh] overflow-y-auto">
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
              {editingProduct ? "Ürünü Düzenle" : "Yeni Ürün Ekle"}
            </h3>

            {formError && (
              <div className="mt-3 p-2.5 rounded bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/40 text-rose-600 dark:text-rose-400 text-xs font-medium">
                {formError}
              </div>
            )}

            <form onSubmit={handleFormSubmit} className="mt-4 space-y-4 text-xs">
              {/* Ürün Adı (TR & EN) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-stone-700 dark:text-stone-300 mb-1">
                    Ürün Adı (Türkçe) *
                  </label>
                  <input
                    type="text"
                    name="name"
                    required
                    defaultValue={editingProduct?.name || ""}
                    placeholder="Örn: Flat White"
                    className="w-full rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 p-2.5 text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-stone-700 dark:text-stone-300 mb-1">
                    Ürün Adı (İngilizce - EN)
                  </label>
                  <input
                    type="text"
                    name="nameEn"
                    defaultValue={editingProduct?.nameEn || ""}
                    placeholder="Örn: Flat White"
                    className="w-full rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 p-2.5 text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
              </div>

              {/* Kategori, Fiyat ve Rozet */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-stone-700 dark:text-stone-300 mb-1">
                    Kategori *
                  </label>
                  <select
                    name="categoryId"
                    required
                    defaultValue={editingProduct?.categoryId || categories[0]?.id}
                    className="w-full rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 p-2.5 text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.icon ? `${c.icon} ` : ""}{c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-stone-700 dark:text-stone-300 mb-1">
                    Fiyat (₺) *
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    name="price"
                    required
                    defaultValue={editingProduct?.price || ""}
                    placeholder="135"
                    className="w-full rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 p-2.5 text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-stone-700 dark:text-stone-300 mb-1">
                    Öne Çıkarma Rozeti
                  </label>
                  <select
                    name="badge"
                    defaultValue={editingProduct?.badge || ""}
                    className="w-full rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 p-2.5 text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  >
                    <option value="">Rozet Yok</option>
                    <option value="chef">Şefin Seçimi (Chef)</option>
                    <option value="popular">Çok Satan (Popular)</option>
                    <option value="deal">Günün Fırsatı (Deal)</option>
                    <option value="new">Yeni Lezzet (New)</option>
                  </select>
                </div>
              </div>

              {/* Açıklama (TR & EN) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-stone-700 dark:text-stone-300 mb-1">
                    Açıklama (Türkçe)
                  </label>
                  <textarea
                    name="description"
                    rows={2}
                    defaultValue={editingProduct?.description || ""}
                    placeholder="Çift shot ristretto ve kadifemsi mikro köpük..."
                    className="w-full rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 p-2.5 text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-stone-700 dark:text-stone-300 mb-1">
                    Açıklama (İngilizce - EN)
                  </label>
                  <textarea
                    name="descriptionEn"
                    rows={2}
                    defaultValue={editingProduct?.descriptionEn || ""}
                    placeholder="Double ristretto espresso infused with velvety microfoam milk..."
                    className="w-full rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 p-2.5 text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
              </div>

              {/* Besin & Hazırlık Değerleri (Kalori & Süre) */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-stone-700 dark:text-stone-300 mb-1">
                    Kalori (kcal)
                  </label>
                  <input
                    type="number"
                    name="calories"
                    defaultValue={editingProduct?.calories || ""}
                    placeholder="Örn: 165"
                    className="w-full rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 p-2.5 text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-stone-700 dark:text-stone-300 mb-1">
                    Hazırlık Süresi (Dakika)
                  </label>
                  <input
                    type="number"
                    name="prepTimeMinutes"
                    defaultValue={editingProduct?.prepTimeMinutes || ""}
                    placeholder="Örn: 4"
                    className="w-full rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 p-2.5 text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
              </div>

              {/* Görsel Yükleme / URL */}
              <div>
                <label className="block font-semibold text-stone-700 dark:text-stone-300 mb-1">
                  Ürün Görseli (URL veya Cihazdan Yükle)
                </label>
                <div className="flex gap-2">
                  <input
                    type="url"
                    value={imageUrlInput}
                    onChange={(e) => setImageUrlInput(e.target.value)}
                    placeholder="https://images.unsplash.com/..."
                    className="flex-1 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 p-2 text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                  <label className="cursor-pointer flex items-center gap-1 rounded-xl bg-stone-100 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 px-3 py-2 text-stone-600 dark:text-stone-300 hover:bg-stone-200">
                    <Upload className="h-4 w-4" />
                    <span>{isUploading ? "Yükleniyor..." : "Yükle"}</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileUpload}
                      className="hidden"
                      disabled={isUploading}
                    />
                  </label>
                </div>

                {/* Görsel Önizleme */}
                {imageUrlInput && (
                  <div className="mt-2 h-20 w-20 overflow-hidden rounded-xl border border-stone-200 dark:border-stone-700">
                    <img
                      src={imageUrlInput}
                      alt="Önizleme"
                      className="h-full w-full object-cover"
                    />
                  </div>
                )}
              </div>

              {/* Alerjenler (TR & EN) ve Sıra */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-stone-700 dark:text-stone-300 mb-1">
                    Alerjenler (TR)
                  </label>
                  <input
                    type="text"
                    name="allergens"
                    defaultValue={editingProduct?.allergens || ""}
                    placeholder="Laktoz / Süt"
                    className="w-full rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 p-2.5 text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-stone-700 dark:text-stone-300 mb-1">
                    Alerjenler (EN)
                  </label>
                  <input
                    type="text"
                    name="allergensEn"
                    defaultValue={editingProduct?.allergensEn || ""}
                    placeholder="Dairy / Milk"
                    className="w-full rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 p-2.5 text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-stone-700 dark:text-stone-300 mb-1">
                    Sıralama (Order)
                  </label>
                  <input
                    type="number"
                    name="order"
                    defaultValue={editingProduct?.order || 0}
                    className="w-full rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 p-2.5 text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
              </div>

              {/* Stokta Var Toggle */}
              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="isAvailableInput"
                  name="isAvailable"
                  defaultChecked={editingProduct ? editingProduct.isAvailable : true}
                  className="h-4 w-4 rounded text-amber-600 focus:ring-amber-500"
                />
                <label htmlFor="isAvailableInput" className="font-semibold text-stone-700 dark:text-stone-300">
                  Ürün Stokta Var (Menüde siparişe açık)
                </label>
              </div>

              {/* Butonlar */}
              <div className="mt-6 flex justify-end gap-2 border-t border-stone-200 dark:border-stone-800 pt-4">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="rounded-xl px-4 py-2 font-semibold text-stone-500 hover:bg-stone-100 dark:hover:bg-stone-800"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="rounded-xl bg-amber-600 px-5 py-2 font-bold text-white shadow hover:bg-amber-700 disabled:opacity-50"
                >
                  {isSubmitting
                    ? "Kaydediliyor..."
                    : editingProduct
                    ? "Güncellemeleri Kaydet"
                    : "Ürünü Kaydet"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Çapraz Satış ve Ekstralar Modalı */}
      {crossSellProduct && (
        <ProductCrossSellModal
          product={crossSellProduct}
          allProducts={products}
          onClose={() => setCrossSellProduct(null)}
        />
      )}
    </div>
  );
}
