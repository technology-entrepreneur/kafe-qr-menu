"use client";

import { motion, AnimatePresence } from "framer-motion";
import { ShoppingBag, X, Trash2, Utensils } from "lucide-react";
import { useMenuStore } from "@/lib/store";
import { calculateCartSummary, formatMoney } from "@/lib/cartMath";
import { Language } from "@/types/menu";

interface CartTrayDrawerProps {
  language?: Language;
}

export default function CartTrayDrawer({ language = "tr" }: CartTrayDrawerProps) {
  const isEn = language === "en";
  const { cart, isCartOpen, setIsCartOpen, removeFromCart, clearCart } = useMenuStore();

  const { total: totalTrayPrice, itemCount: totalQuantity } = calculateCartSummary(cart);

  return (
    <AnimatePresence>
      {isCartOpen && cart.length > 0 && (
        <div className="fixed inset-0 z-50 flex items-end justify-center p-0 sm:p-4">
          {/* Karartma Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsCartOpen(false)}
            className="fixed inset-0 bg-black/75 backdrop-blur-sm"
          />

          {/* Çekmece Gövdesi */}
          <motion.div
            initial={{ y: "100%", opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: "100%", opacity: 0 }}
            transition={{ type: "spring", damping: 28, stiffness: 300 }}
            className="relative w-full max-w-lg rounded-t-[2.5rem] sm:rounded-3xl bg-[#0c0a09] border-t sm:border border-stone-800 text-stone-100 shadow-2xl z-10 max-h-[88vh] flex flex-col font-sans overflow-hidden"
          >
            {/* Tutamaç */}
            <div className="sm:hidden mx-auto my-3 h-1.5 w-12 rounded-full bg-stone-700/80" />

            {/* Başlık Alanı */}
            <div className="flex items-center justify-between p-5 border-b border-stone-800/80">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-amber-500/15 border border-amber-500/30 text-amber-400">
                  <ShoppingBag className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-bold font-display text-white">
                    {isEn ? `Order Tray (${totalQuantity} items)` : `Masa Tepsiniz (${totalQuantity} Parça)`}
                  </h3>
                  <p className="text-xs text-stone-400">
                    {isEn ? "Selected items & customizations" : "Seçtiğiniz lezzetler ve ekstralar"}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={clearCart}
                  className="p-2 rounded-xl text-stone-400 hover:text-rose-400 hover:bg-stone-900 border border-transparent hover:border-stone-800 transition-all cursor-pointer"
                  title={isEn ? "Clear Tray" : "Tepsiyi Temizle"}
                >
                  <Trash2 className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setIsCartOpen(false)}
                  className="p-2 rounded-xl text-stone-400 hover:text-white hover:bg-stone-900 border border-transparent hover:border-stone-800 transition-all cursor-pointer"
                  title={isEn ? "Close" : "Kapat"}
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Ürün Listesi */}
            <div className="p-5 overflow-y-auto space-y-3 flex-1 no-scrollbar">
              {cart.map((item, idx) => {
                const prodName = isEn && item.product.nameEn ? item.product.nameEn : item.product.name;

                return (
                  <div
                    key={idx}
                    className="flex items-start justify-between gap-3 rounded-2xl bg-stone-900/80 border border-stone-800/80 p-3.5 shadow-sm"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded-lg bg-amber-500/20 text-amber-300 font-extrabold text-[11px] flex items-center justify-center">
                          {item.quantity}×
                        </span>
                        <h4 className="font-bold text-xs text-white truncate">
                          {prodName}
                        </h4>
                      </div>

                      {/* Seçili Ekstralar */}
                      {item.selectedOptions && item.selectedOptions.length > 0 && (
                        <div className="mt-1.5 pl-7 space-y-0.5">
                          {item.selectedOptions.map((opt, sIdx) => (
                            <p key={sIdx} className="text-[11px] text-amber-400/90">
                              + {opt.name} ({opt.price > 0 ? `+₺${opt.price}` : isEn ? "Free" : "Ücretsiz"})
                            </p>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="text-right flex items-center gap-2.5 flex-shrink-0">
                      <span className="text-sm font-extrabold text-amber-400 font-display">
                        {formatMoney(item.totalPrice)}
                      </span>
                      <button
                        type="button"
                        onClick={() => removeFromCart(idx)}
                        className="text-stone-500 hover:text-rose-400 p-1.5 rounded-lg hover:bg-stone-800 transition-colors"
                        title={isEn ? "Remove item" : "Ürünü Çıkar"}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}

              {/* Servis Personeline Gösterme Bilgilendirmesi */}
              <div className="rounded-2xl bg-gradient-to-r from-amber-500/10 via-stone-900/60 to-amber-950/20 p-3.5 border border-amber-500/25 text-xs text-amber-200/90 flex items-center gap-3">
                <Utensils className="h-5 w-5 flex-shrink-0 text-amber-400" />
                <span className="leading-relaxed">
                  {isEn
                    ? "Show this tray summary to your server to place your order in seconds!"
                    : "Masadaki servis personelimize bu listeyi göstererek siparişinizi saniyeler içinde verebilirsiniz!"}
                </span>
              </div>
            </div>

            {/* Alt Toplam & Menüye Dön Butonu */}
            <div className="p-4 border-t border-stone-800 bg-[#0c0a09] flex items-center justify-between gap-3">
              <div>
                <span className="text-[10px] text-stone-400 uppercase font-bold tracking-wider">
                  {isEn ? "Grand Total" : "Genel Toplam"}
                </span>
                <p className="text-xl sm:text-2xl font-black font-display text-amber-400">
                  {formatMoney(totalTrayPrice)}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setIsCartOpen(false)}
                className="rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 px-6 py-3 text-xs font-bold text-stone-950 shadow-lg shadow-amber-500/20 active:scale-95 transition-all cursor-pointer"
              >
                {isEn ? "Continue Browsing" : "Menüye Dön"}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
