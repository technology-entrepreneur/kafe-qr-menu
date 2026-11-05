"use client";

import { useState } from "react";
import { X, Sparkles, Flame, Plus, Trash2, Check, Save } from "lucide-react";
import { ProductItem } from "@/lib/types";
import {
  setProductCrossSellsAction,
  addProductExtraGroupAction,
  removeProductExtraGroupAction,
} from "@/actions/products";

interface ProductCrossSellModalProps {
  product: ProductItem;
  allProducts: ProductItem[];
  onClose: () => void;
}

export default function ProductCrossSellModal({
  product,
  allProducts,
  onClose,
}: ProductCrossSellModalProps) {
  // Mevcut önerilen ürün ID'leri
  const initialSuggestedIds = (product.suggestions || []).map((s) => s.suggestedProductId);
  const [selectedCrossSellIds, setSelectedCrossSellIds] = useState<string[]>(initialSuggestedIds);
  const [isSavingCrossSells, setIsSavingCrossSells] = useState(false);
  const [crossSellSaved, setCrossSellSaved] = useState(false);

  // Yeni Ekstra Grubu Ekleme Form Durumu
  const [isAddingGroup, setIsAddingGroup] = useState(false);
  const [groupTitle, setGroupTitle] = useState("");
  const [isRequired, setIsRequired] = useState(false);
  const [maxSelect, setMaxSelect] = useState(1);
  const [options, setOptions] = useState<{ name: string; price: number }[]>([
    { name: "", price: 0 },
  ]);

  // Çapraz Satış ID Toggle
  const toggleCrossSell = (targetId: string) => {
    if (selectedCrossSellIds.includes(targetId)) {
      setSelectedCrossSellIds(selectedCrossSellIds.filter((id) => id !== targetId));
    } else {
      setSelectedCrossSellIds([...selectedCrossSellIds, targetId]);
    }
  };

  // Çapraz Satışları Kaydet
  const handleSaveCrossSells = async () => {
    setIsSavingCrossSells(true);
    try {
      const res = await setProductCrossSellsAction(product.id, selectedCrossSellIds);
      if (res && !res.success) {
        alert(res.error || "Öneriler kaydedilirken hata oluştu.");
        setIsSavingCrossSells(false);
        return;
      }
      setIsSavingCrossSells(false);
      setCrossSellSaved(true);
      setTimeout(() => setCrossSellSaved(false), 2000);
    } catch (err: any) {
      alert(err.message || "Kaydetme sırasında bir hata oluştu.");
      setIsSavingCrossSells(false);
    }
  };

  // Ekstra Grubu Seçenek Satırı Ekle
  const addOptionRow = () => {
    setOptions([...options, { name: "", price: 0 }]);
  };

  const removeOptionRow = (index: number) => {
    setOptions(options.filter((_, i) => i !== index));
  };

  const updateOptionRow = (index: number, field: "name" | "price", value: string | number) => {
    const updated = [...options];
    updated[index] = { ...updated[index], [field]: value };
    setOptions(updated);
  };

  // Yeni Ekstra Grubu Kaydet
  const handleSaveExtraGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    const validOptions = options.filter((o) => o.name.trim() !== "");
    if (!groupTitle.trim() || validOptions.length === 0) {
      alert("Lütfen grup başlığı ve en az bir seçenek girin.");
      return;
    }

    try {
      const res = await addProductExtraGroupAction(
        product.id,
        groupTitle,
        isRequired,
        maxSelect,
        validOptions
      );

      if (res && !res.success) {
        alert(res.error || "Ekstra grubu eklenirken bir hata oluştu.");
        return;
      }

      setIsAddingGroup(false);
      setGroupTitle("");
      setOptions([{ name: "", price: 0 }]);
    } catch (err: any) {
      alert(err.message || "İşlem sırasında bir hata oluştu.");
    }
  };

  const handleDeleteGroup = async (groupId: string) => {
    if (confirm("Bu ekstra grubunu silmek istediğinize emin misiniz?")) {
      await removeProductExtraGroupAction(groupId);
    }
  };

  // Kendisi hariç diğer ürünler
  const otherProducts = allProducts.filter((p) => p.id !== product.id);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 font-sans">
      <div className="relative w-full max-w-2xl rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 max-h-[90vh] flex flex-col overflow-hidden">
        {/* Başlık Çubuğu */}
        <div className="p-5 border-b border-stone-200 dark:border-stone-800 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-amber-600">
              Satış & Dönüşüm (CRO) Modülü
            </span>
            <h3 className="text-lg font-black font-display text-stone-900 dark:text-stone-100">
              {product.name} — Çapraz Satış & Ekstralar
            </h3>
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-1.5 text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Gövde */}
        <div className="p-6 overflow-y-auto space-y-6 text-xs flex-1">
          {/* BÖLÜM 1: "BİRLİKTE HARİKA GİDER" (ÇAPRAZ SATIŞ EŞLEŞTİRME) */}
          <div className="rounded-2xl bg-stone-50 dark:bg-stone-800/50 p-4 border border-stone-200/80 dark:border-stone-700 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs font-bold text-stone-900 dark:text-stone-100">
                <Flame className="h-4 w-4 fill-amber-500 text-amber-500" />
                <span>&quot;Birlikte Harika Gider&quot; Tamamlayıcı Ürün Önerileri</span>
              </div>
              <button
                onClick={handleSaveCrossSells}
                disabled={isSavingCrossSells}
                className="flex items-center gap-1.5 rounded-xl bg-amber-600 px-3.5 py-1.5 font-bold text-white shadow hover:bg-amber-700 disabled:opacity-50"
              >
                {crossSellSaved ? (
                  <>
                    <Check className="h-3.5 w-3.5 text-white" />
                    <span>Kaydedildi</span>
                  </>
                ) : (
                  <>
                    <Save className="h-3.5 w-3.5" />
                    <span>Önerileri Kaydet</span>
                  </>
                )}
              </button>
            </div>
            <p className="text-[11px] text-stone-500">
              Müşteri {product.name} ürününü seçtiğinde yanında önerilecek 2-3 tamamlayıcı lezzeti işaretleyin.
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-1 max-h-48 overflow-y-auto pr-1">
              {otherProducts.map((p) => {
                const isSelected = selectedCrossSellIds.includes(p.id);
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => toggleCrossSell(p.id)}
                    className={`flex items-center gap-2 rounded-xl p-2 text-left border transition-all ${
                      isSelected
                        ? "bg-amber-50 dark:bg-amber-950/40 border-amber-500 text-amber-900 dark:text-amber-200 font-bold"
                        : "bg-white dark:bg-stone-850 border-stone-200 dark:border-stone-700 text-stone-700 dark:text-stone-300"
                    }`}
                  >
                    <div
                      className={`h-4 w-4 rounded-md border flex items-center justify-center flex-shrink-0 ${
                        isSelected
                          ? "bg-amber-600 border-amber-600 text-white"
                          : "border-stone-400"
                      }`}
                    >
                      {isSelected && <Check className="h-3 w-3 stroke-[3]" />}
                    </div>
                    <span className="truncate text-[11px]">{p.name} (₺{p.price})</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* BÖLÜM 2: EKSTRA & OPSİYON GRUPLARI (Süt Seçimi, Şurup vb.) */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs font-bold text-stone-900 dark:text-stone-100">
                <Sparkles className="h-4 w-4 text-amber-600" />
                <span>Ürüne Tanımlı Ekstra & Varyant Grupları</span>
              </div>
              {!isAddingGroup && (
                <button
                  onClick={() => setIsAddingGroup(true)}
                  className="flex items-center gap-1 rounded-xl bg-stone-100 dark:bg-stone-800 px-3 py-1 font-semibold text-stone-700 dark:text-stone-300 hover:bg-stone-200"
                >
                  <Plus className="h-3.5 w-3.5" />
                  <span>Yeni Grup Ekle</span>
                </button>
              )}
            </div>

            {/* Mevcut Gruplar */}
            {product.extraGroups && product.extraGroups.length > 0 ? (
              <div className="space-y-2">
                {product.extraGroups.map((group) => (
                  <div
                    key={group.id}
                    className="flex items-center justify-between rounded-xl bg-stone-50 dark:bg-stone-800/40 p-3 border border-stone-200 dark:border-stone-700"
                  >
                    <div>
                      <span className="font-bold text-stone-900 dark:text-stone-100">
                        {group.title}
                      </span>
                      <span className="ml-2 text-[10px] text-stone-400">
                        ({group.options.length} Seçenek • {group.isRequired ? "Zorunlu" : "İsteğe Bağlı"})
                      </span>
                      <p className="mt-0.5 text-[11px] text-stone-500">
                        {group.options.map((o) => `${o.name} (+₺${o.price})`).join(", ")}
                      </p>
                    </div>

                    <button
                      onClick={() => handleDeleteGroup(group.id)}
                      className="p-1 text-stone-400 hover:text-rose-500"
                      title="Grubu Sil"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              !isAddingGroup && (
                <p className="text-[11px] text-stone-400 italic">
                  Bu ürüne henüz ekstra/opsiyon grubu tanımlanmamış (Örn: Süt tercihi, ekstra shot).
                </p>
              )
            )}

            {/* Yeni Grup Ekleme Formu */}
            {isAddingGroup && (
              <form onSubmit={handleSaveExtraGroup} className="rounded-2xl bg-amber-50/50 dark:bg-stone-800 p-4 border border-amber-300/60 dark:border-amber-800 space-y-3">
                <h4 className="font-bold text-xs text-amber-900 dark:text-amber-200">
                  Yeni Opsiyon Grubu Tanımla
                </h4>

                <div className="grid grid-cols-3 gap-2">
                  <div className="col-span-2">
                    <label className="block text-[11px] font-semibold mb-1">Grup Başlığı</label>
                    <input
                      type="text"
                      required
                      value={groupTitle}
                      onChange={(e) => setGroupTitle(e.target.value)}
                      placeholder="Örn: Süt Tercihi"
                      className="w-full rounded-xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 p-2"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold mb-1">Maks. Seçim</label>
                    <input
                      type="number"
                      value={maxSelect}
                      min={1}
                      onChange={(e) => setMaxSelect(parseInt(e.target.value) || 1)}
                      className="w-full rounded-xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 p-2"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="reqCheck"
                    checked={isRequired}
                    onChange={(e) => setIsRequired(e.target.checked)}
                    className="h-4 w-4 rounded text-amber-600"
                  />
                  <label htmlFor="reqCheck" className="text-[11px] font-semibold">
                    Müşteri siparişte bu gruptan en az 1 seçim yapmak zorunda olsun
                  </label>
                </div>

                {/* Seçenek Satırları */}
                <div className="space-y-2 pt-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold">Seçenekler & Ek Ücretler</span>
                    <button
                      type="button"
                      onClick={addOptionRow}
                      className="text-[11px] font-bold text-amber-600 hover:underline"
                    >
                      + Seçenek Ekle
                    </button>
                  </div>

                  {options.map((opt, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <input
                        type="text"
                        placeholder="Örn: Yulaf Sütü"
                        value={opt.name}
                        onChange={(e) => updateOptionRow(i, "name", e.target.value)}
                        className="flex-1 rounded-xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 p-1.5"
                      />
                      <input
                        type="number"
                        placeholder="+ Ek Ücret (₺)"
                        value={opt.price}
                        onChange={(e) => updateOptionRow(i, "price", parseFloat(e.target.value) || 0)}
                        className="w-24 rounded-xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 p-1.5"
                      />
                      {options.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeOptionRow(i)}
                          className="p-1 text-stone-400 hover:text-rose-500"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsAddingGroup(false)}
                    className="px-3 py-1.5 text-stone-500 font-semibold"
                  >
                    Vazgeç
                  </button>
                  <button
                    type="submit"
                    className="rounded-xl bg-amber-600 px-4 py-1.5 font-bold text-white shadow hover:bg-amber-700"
                  >
                    Grubu Kaydet
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>

        {/* Alt Kapat Butonu */}
        <div className="p-4 border-t border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-950 flex justify-end">
          <button
            onClick={onClose}
            className="rounded-xl bg-stone-800 text-white px-5 py-2 font-bold text-xs shadow hover:bg-stone-900"
          >
            Tamamla & Kapat
          </button>
        </div>
      </div>
    </div>
  );
}
