"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ShoppingBag, X, Trash2, Utensils, Plus, Minus, Bell, CheckCircle2, Sparkles, Check } from "lucide-react";
import { useMenuStore } from "@/lib/store";
import { calculateCartSummary, formatMoney } from "@/lib/cartMath";
import { Language } from "@/types/menu";
import { triggerGoldenConfetti } from "@/lib/confetti";

interface CartTrayDrawerProps {
  language?: Language;
  tableNumber?: string | null;
}

export default function CartTrayDrawer({
  language = "tr",
  tableNumber,
}: CartTrayDrawerProps) {
  const isEn = language === "en";
  const { cart, isCartOpen, setIsCartOpen, removeFromCart, updateQuantity, clearCart } = useMenuStore();
  const [orderSent, setOrderSent] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { total: totalTrayPrice, itemCount: totalQuantity } = calculateCartSummary(cart);

  const handleSendOrder = async (e: React.MouseEvent) => {
    setIsSubmitting(true);
    const rect = (e.target as HTMLElement).getBoundingClientRect();
    const x = (rect.left + rect.width / 2) / window.innerWidth;
    const y = (rect.top + rect.height / 2) / window.innerHeight;
    triggerGoldenConfetti(x, y);

    setTimeout(() => {
      setIsSubmitting(false);
      setOrderSent(true);
    }, 400);
  };

  const handleCloseAndReset = () => {
    if (orderSent) {
      clearCart();
      setOrderSent(false);
    }
    setIsCartOpen(false);
  };

  return (
    <AnimatePresence>
      {isCartOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-center p-0 sm:p-4">
          {/* Karartma Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleCloseAndReset}
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

            {/* Sipariş Onay Ekranı */}
            {orderSent ? (
              <div className="p-8 flex flex-col items-center text-center my-auto space-y-4">
                <div className="relative">
                  <div className="w-20 h-20 rounded-3xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 shadow-lg shadow-amber-500/20">
                    <CheckCircle2 className="w-10 h-10 stroke-[2.5]" />
                  </div>
                  <Sparkles className="w-6 h-6 text-amber-300 absolute -top-1 -right-1 animate-pulse" />
                </div>

                <div className="space-y-1">
                  <h3 className="text-2xl font-black font-display text-white">
                    {isEn ? "Order Sent to Staff!" : "Siparişiniz İletildi!"}
                  </h3>
                  <p className="text-xs text-amber-300 font-semibold uppercase tracking-wider">
                    {tableNumber
                      ? isEn
                        ? `Table ${tableNumber} • Confirmed`
                        : `Masa ${tableNumber} • Onaylandı`
                      : isEn
                      ? "Confirmed"
                      : "Masaya Kaydedildi"}
                  </p>
                </div>

                <p className="text-xs sm:text-sm text-stone-300 max-w-xs leading-relaxed">
                  {isEn
                    ? "Your order has been transmitted. Our barista & service team is preparing your selection."
                    : "Sipariş detaylarınız servis ekibimize iletildi. Lezzetleriniz en kısa sürede masanıza ulaştırılacaktır."}
                </p>

                <div className="pt-4 w-full">
                  <button
                    type="button"
                    onClick={handleCloseAndReset}
                    className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 font-bold text-sm text-stone-950 shadow-xl shadow-amber-500/25 active:scale-98 transition-all cursor-pointer"
                  >
                    {isEn ? "Back to Menu" : "Menüye Dön"}
                  </button>
                </div>
              </div>
            ) : (
              <>
                {/* Başlık Alanı */}
                <div className="flex items-center justify-between p-5 border-b border-stone-800/80">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-amber-500/15 border border-amber-500/30 text-amber-400">
                      <ShoppingBag className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-base sm:text-lg font-bold font-display text-white">
                          {isEn ? `Order Tray (${totalQuantity})` : `Masa Tepsiniz (${totalQuantity})`}
                        </h3>
                        {tableNumber && (
                          <span className="text-[10px] font-bold text-amber-300 bg-amber-500/15 border border-amber-500/30 px-2 py-0.5 rounded-full">
                            {isEn ? `Table ${tableNumber}` : `Masa ${tableNumber}`}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-stone-400">
                        {isEn ? "Selected items & customizations" : "Seçtiğiniz lezzetler ve ekstralar"}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5">
                    {cart.length > 0 && (
                      <button
                        type="button"
                        onClick={clearCart}
                        className="p-2 rounded-xl text-stone-400 hover:text-rose-400 hover:bg-stone-900 border border-transparent hover:border-stone-800 transition-all cursor-pointer"
                        title={isEn ? "Clear Tray" : "Tepsiyi Temizle"}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
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

                {/* Ürün Listesi veya Boş Durum */}
                {cart.length === 0 ? (
                  <div className="p-8 text-center space-y-3 flex-1 flex flex-col items-center justify-center">
                    <div className="w-16 h-16 rounded-2xl bg-stone-900 border border-stone-800 flex items-center justify-center text-stone-500">
                      <ShoppingBag className="w-8 h-8" />
                    </div>
                    <p className="text-sm font-bold text-stone-300">
                      {isEn ? "Your tray is currently empty" : "Tepsinizde henüz ürün yok"}
                    </p>
                    <p className="text-xs text-stone-500 max-w-xs">
                      {isEn
                        ? "Select your favorite coffee, dessert or combo deals to start your order."
                        : "Menüden kahve, tatlı veya kampanyalı menüleri seçerek tepsinize ekleyebilirsiniz."}
                    </p>
                  </div>
                ) : (
                  <div className="p-5 overflow-y-auto space-y-3 flex-1 no-scrollbar">
                    {cart.map((item, idx) => {
                      const prodName = isEn && item.product.nameEn ? item.product.nameEn : item.product.name;
                      const itemUnitPrice = item.quantity > 0 ? item.totalPrice / item.quantity : 0;

                      return (
                        <div
                          key={idx}
                          className="flex items-start justify-between gap-3 rounded-2xl bg-stone-900/80 border border-stone-800/80 p-3.5 shadow-sm"
                        >
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <h4 className="font-bold text-xs sm:text-sm text-white truncate">
                                {prodName}
                              </h4>
                            </div>

                            {/* Seçili Ekstralar */}
                            {item.selectedOptions && item.selectedOptions.length > 0 && (
                              <div className="mt-1 space-y-0.5">
                                {item.selectedOptions.map((opt, sIdx) => (
                                  <p key={sIdx} className="text-[11px] text-amber-400/90">
                                    + {opt.name} ({opt.price > 0 ? `+₺${opt.price}` : isEn ? "Free" : "Ücretsiz"})
                                  </p>
                                ))}
                              </div>
                            )}

                            {/* Adet Ayar Düğmeleri (+ / -) */}
                            <div className="mt-2.5 flex items-center gap-2">
                              <div className="flex items-center bg-stone-950 border border-stone-800 rounded-xl p-0.5">
                                <button
                                  type="button"
                                  onClick={() => updateQuantity(idx, item.quantity - 1)}
                                  className="w-7 h-7 rounded-lg bg-stone-900 hover:bg-stone-800 text-stone-300 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
                                  title={isEn ? "Decrease" : "Azalt"}
                                >
                                  <Minus className="w-3 h-3" />
                                </button>
                                <span className="w-7 text-center font-black text-xs text-amber-400">
                                  {item.quantity}
                                </span>
                                <button
                                  type="button"
                                  onClick={() => updateQuantity(idx, item.quantity + 1)}
                                  className="w-7 h-7 rounded-lg bg-stone-900 hover:bg-stone-800 text-stone-300 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
                                  title={isEn ? "Increase" : "Artır"}
                                >
                                  <Plus className="w-3 h-3" />
                                </button>
                              </div>
                              <span className="text-[11px] text-stone-500 font-medium">
                                {formatMoney(itemUnitPrice)} / {isEn ? "ea" : "adet"}
                              </span>
                            </div>
                          </div>

                          <div className="text-right flex flex-col items-end justify-between h-full gap-2 flex-shrink-0">
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
                          ? "You can confirm your tray below or directly show it to your table server!"
                          : "Tepsinizi aşağıdan tek tıkla personele iletebilir veya masadaki garsona gösterebilirsiniz!"}
                      </span>
                    </div>
                  </div>
                )}

                {/* Alt Toplam & Aksiyon Butonları */}
                {cart.length > 0 && (
                  <div className="p-4 border-t border-stone-800 bg-[#0c0a09] flex flex-col gap-3">
                    <div className="flex items-center justify-between">
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
                        className="text-xs text-stone-400 hover:text-stone-200 px-3 py-1.5 rounded-xl hover:bg-stone-900 border border-stone-800 transition-colors"
                      >
                        {isEn ? "Continue Browsing" : "Menüye Dön"}
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={handleSendOrder}
                      disabled={isSubmitting}
                      className="w-full flex items-center justify-center gap-2 py-3.5 px-4 rounded-2xl bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 hover:brightness-105 text-stone-950 font-black text-sm shadow-xl shadow-amber-500/20 active:scale-98 transition-all cursor-pointer disabled:opacity-75"
                    >
                      <Bell className="w-4 h-4" />
                      <span>
                        {isEn
                          ? `Send Order to Server (${formatMoney(totalTrayPrice)})`
                          : `Siparişi Garsona İlet (${formatMoney(totalTrayPrice)})`}
                      </span>
                    </button>
                  </div>
                )}
              </>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
