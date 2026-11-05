"use client";

import React from "react";
import {
  Receipt,
  X,
  Clock,
  CheckCircle2,
  ChefHat,
  Coffee,
  Users2,
  CreditCard,
  ChevronRight,
  Utensils,
} from "lucide-react";
import { formatMoney } from "@/lib/cartMath";
import { Language } from "@/types/menu";
import { ActiveOrder, OrderStatus } from "@/lib/hooks/useTableSession";

interface ActiveOrdersDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  tableNumber: string;
  orders: ActiveOrder[];
  totalAmount: number;
  language?: Language;
  onOpenBillModal?: () => void;
  onOpenBillSplit?: () => void;
}

export default function ActiveOrdersDrawer({
  isOpen,
  onClose,
  tableNumber,
  orders,
  totalAmount,
  language = "tr",
  onOpenBillModal,
  onOpenBillSplit,
}: ActiveOrdersDrawerProps) {
  const isEn = language === "en";

  const getStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case "PENDING":
        return {
          label: isEn ? "Received" : "Alındı",
          color: "bg-slate-800 text-amber-400 border-slate-700",
          icon: <Clock className="w-3 h-3" />,
        };
      case "PREPARING":
        return {
          label: isEn ? "Preparing" : "Hazırlanıyor",
          color: "bg-slate-800 text-sky-400 border-slate-700",
          icon: <Utensils className="w-3 h-3" />,
        };
      case "READY":
        return {
          label: isEn ? "Ready" : "Hazır",
          color: "bg-slate-800 text-emerald-400 border-slate-700",
          icon: <CheckCircle2 className="w-3 h-3" />,
        };
      case "SERVED":
        return {
          label: isEn ? "Served" : "Servis Edildi",
          color: "bg-slate-800 text-slate-300 border-slate-700",
          icon: <CheckCircle2 className="w-3 h-3 text-slate-400" />,
        };
      case "CANCELLED":
        return {
          label: isEn ? "Cancelled" : "İptal",
          color: "bg-slate-800 text-rose-400 border-slate-700",
          icon: <X className="w-3 h-3" />,
        };
    }
  };

  const allActiveOrders = orders.filter((o) => o.status !== "CANCELLED");

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center p-0 sm:p-4">
      <div
        onClick={onClose}
        className="fixed inset-0 bg-black/60"
      />

      <div
        className="relative w-full max-w-lg rounded-t-xl sm:rounded-lg bg-slate-900 border-t sm:border border-slate-800 text-slate-100 shadow-xl z-10 max-h-[90vh] flex flex-col font-sans overflow-hidden"
      >
        <div className="sm:hidden mx-auto my-2.5 h-1 w-10 rounded-full bg-slate-700" />

        {/* Başlık */}
        <div className="flex items-center justify-between p-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300">
              <Receipt className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="text-sm font-bold text-white">
                  {isEn ? "Table Tab" : "Masa Hesabım"}
                </h3>
                <span className="text-[10px] font-semibold text-slate-300 bg-slate-800 border border-slate-700 px-1.5 py-0.5 rounded">
                  Masa {tableNumber}
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                {isEn ? "Live orders for this table" : "Masaya ait aktif siparişler"}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* İçerik */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 no-scrollbar">
          {allActiveOrders.length === 0 ? (
            <div className="py-12 text-center space-y-2">
              <div className="w-10 h-10 rounded bg-slate-800 border border-slate-700 flex items-center justify-center mx-auto text-slate-500">
                <Receipt className="w-5 h-5" />
              </div>
              <p className="text-sm font-medium text-slate-300">
                {isEn ? "No active orders yet" : "Henüz siparişiniz bulunmuyor"}
              </p>
              <p className="text-xs text-slate-500 max-w-xs mx-auto">
                {isEn
                  ? "Orders placed from this table will appear here in real-time."
                  : "Masanızdan verilen siparişler burada canlı olarak listelenir."}
              </p>
            </div>
          ) : (
            <div className="space-y-2.5">
              {allActiveOrders.map((order, orderIdx) => {
                const badge = getStatusBadge(order.status);
                const isBar = order.kdsStation === "bar";

                return (
                  <div
                    key={order.id}
                    className="rounded-lg bg-slate-950 border border-slate-800 p-3 space-y-2"
                  >
                    {/* Tur Başlığı */}
                    <div className="flex items-center justify-between pb-1.5 border-b border-slate-800/80 text-xs">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-white">
                          {isEn ? `Round #${orderIdx + 1}` : `${orderIdx + 1}. Sipariş`}
                        </span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-900 text-slate-400 border border-slate-800">
                          {isBar ? "Bar" : "Mutfak"}
                        </span>
                      </div>

                      <div
                        className={`px-2 py-0.5 rounded border text-[10px] font-medium flex items-center gap-1 ${badge.color}`}
                      >
                        {badge.icon}
                        <span>{badge.label}</span>
                      </div>
                    </div>

                    {/* Kalemler */}
                    <div className="space-y-1.5">
                      {order.items.map((item) => (
                        <div
                          key={item.id}
                          className="flex items-start justify-between text-xs"
                        >
                          <div className="flex-1 min-w-0 pr-3">
                            <div className="flex items-baseline gap-1.5 flex-wrap">
                              <span className="font-bold text-amber-400 tabular-nums">
                                {item.quantity}x
                              </span>
                              <span className={`font-medium ${item.isPaid ? "text-slate-400" : "text-slate-200"}`}>
                                {item.productName}
                              </span>
                              {item.isPaid && (
                                <span className="px-1.5 py-0.5 rounded bg-emerald-950 border border-emerald-800 text-emerald-400 text-[9px] font-semibold">
                                  {isEn ? "Paid" : "Ödendi"}
                                </span>
                              )}
                            </div>
                            {item.selectedOptions &&
                              item.selectedOptions.length > 0 && (
                                <div className="text-[11px] text-slate-400 pl-4 space-y-0.5">
                                  {item.selectedOptions.map((opt, oIdx) => (
                                    <p key={oIdx}>+ {opt.name}</p>
                                  ))}
                                </div>
                              )}
                          </div>
                          <span className={`font-semibold tabular-nums ${item.isPaid ? "line-through text-slate-500" : "text-slate-200"}`}>
                            {formatMoney(item.totalPrice)}
                          </span>
                        </div>
                      ))}
                    </div>

                    {/* Tur Alt Toplamı */}
                    <div className="pt-1.5 border-t border-slate-800/60 flex justify-between items-center text-[11px] text-slate-400">
                      <span>
                        {order.source === "waiter" ? "Garson siparişi" : "Masa QR siparişi"}
                      </span>
                      <span className="font-semibold text-amber-400 tabular-nums">
                        {formatMoney(order.totalAmount)}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* ALMAN USULÜ KARTI */}
          {allActiveOrders.length > 0 && onOpenBillSplit && (
            <div
              onClick={() => {
                onClose();
                onOpenBillSplit();
              }}
              className="p-3 rounded-lg bg-slate-950 border border-slate-800 hover:border-slate-700 flex items-center justify-between cursor-pointer transition-colors"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded bg-slate-900 border border-slate-800 text-slate-300 flex items-center justify-center">
                  <Users2 className="w-3.5 h-3.5" />
                </div>
                <div>
                  <h4 className="text-xs font-semibold text-white">
                    {isEn ? "Split The Bill" : "Hesabı Böl (Alman Usulü)"}
                  </h4>
                  <p className="text-[11px] text-slate-400">
                    {isEn ? "Divide equally or select individual items" : "Kişi başı eşit böl veya kendi yediğini hesapla"}
                  </p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-500" />
            </div>
          )}
        </div>

        {/* ALT ÇUBUK: TOPLAM & HESAP İSTE */}
        <div className="p-4 border-t border-slate-800 bg-slate-950 flex flex-col gap-2.5">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-[10px] text-slate-400 uppercase font-medium">
                {isEn ? "Total Table Balance" : "Toplam Masa Tutarı"}
              </span>
              <p className="text-xl font-bold text-amber-400 tabular-nums">
                {formatMoney(totalAmount)}
              </p>
            </div>

            <div className="text-right">
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-emerald-950 border border-emerald-800 text-emerald-400 text-[10px] font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                <span>{isEn ? "Active Session" : "Masa Açık"}</span>
              </span>
            </div>
          </div>

          {onOpenBillModal && (
            <button
              type="button"
              onClick={() => {
                onClose();
                onOpenBillModal();
              }}
              className="w-full py-2.5 px-3 rounded bg-amber-600 hover:bg-amber-500 text-slate-950 font-semibold text-xs transition-colors flex items-center justify-center gap-2"
            >
              <CreditCard className="w-4 h-4" />
              <span>{isEn ? "Request Bill" : "Hesap İste"}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
