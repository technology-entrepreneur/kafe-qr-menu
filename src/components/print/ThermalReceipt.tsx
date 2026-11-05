"use client";

import React from "react";
import { formatMoney } from "@/lib/cartMath";

export interface PrintOrderItem {
  id: string;
  productName: string;
  quantity: number;
  unitPrice?: number;
  totalPrice?: number;
  selectedOptions?: { name: string; price?: number }[];
  isPaid?: boolean;
}

export interface KitchenReceiptData {
  type: "kitchen";
  tableNumber: string;
  orderId?: string;
  source?: string;
  kdsStation: "kitchen" | "bar" | "hookah" | "both" | string;
  createdAt: string | Date;
  notes?: string;
  items: PrintOrderItem[];
}

export interface BillReceiptData {
  type: "bill";
  cafeName: string;
  address?: string | null;
  phone?: string | null;
  wifiSsid?: string | null;
  wifiPassword?: string | null;
  tableNumber: string;
  openedAt?: string | Date;
  printedAt?: string | Date;
  items: PrintOrderItem[];
  totalAmount: number;
  paidAmount?: number;
  remainingAmount?: number;
  paymentMethod?: string;
}

export type ThermalPrintData = KitchenReceiptData | BillReceiptData;

interface ThermalReceiptProps {
  data: ThermalPrintData | null;
}

export default function ThermalReceipt({ data }: ThermalReceiptProps) {
  if (!data) return null;

  const formatDate = (dateInput?: string | Date) => {
    if (!dateInput) return "";
    const d = new Date(dateInput);
    return d.toLocaleString("tr-TR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  };

  return (
    <div
      id="thermal-print-container"
      className="font-mono text-black text-[13px] leading-tight select-none"
    >
      {/* ==================================================== */}
      {/* A) MUTFAK / BAR / NARGİLEHANE SİPARİŞ FİŞİ           */}
      {/* ==================================================== */}
      {data.type === "kitchen" && (
        <div className="space-y-2">
          {/* Fiş İstasyon Başlığı */}
          <div className="text-center pb-2 border-b-2 border-black border-dashed">
            <h2 className="text-xl font-black uppercase tracking-wider">
              {data.kdsStation === "hookah"
                ? "NARGİLEHANE SİPARİŞİ"
                : data.kdsStation === "bar"
                ? "BAR & KAHVE SİPARİŞİ"
                : "MUTFAK SİPARİŞİ"}
            </h2>
            <p className="text-[11px] font-bold mt-0.5">
              {data.source === "waiter" ? "GARSON EL TERMİNALİ" : "MÜŞTERİ QR MENÜ"}
            </p>
          </div>

          {/* BÜYÜK MASA NUMARASI */}
          <div className="py-2.5 text-center border-b-2 border-black">
            <span className="text-3xl font-black tracking-tight block">
              MASA {data.tableNumber}
            </span>
            <div className="flex justify-between items-center text-[11px] mt-1 text-black font-semibold">
              <span>{formatDate(data.createdAt)}</span>
              {data.orderId && <span>#{data.orderId.slice(-6).toUpperCase()}</span>}
            </div>
          </div>

          {/* SİPARİŞ KALEMLERİ (BÜYÜK VE KALIN ADET) */}
          <div className="py-2 border-b-2 border-black border-dashed space-y-3">
            {data.items.map((item, idx) => (
              <div key={idx} className="space-y-1">
                <div className="flex items-start justify-between gap-2">
                  <span className="text-lg font-black leading-snug">
                    [{item.quantity}x] {item.productName}
                  </span>
                </div>

                {/* Seçilen Aromalar / Ekstralar / Mix */}
                {item.selectedOptions && item.selectedOptions.length > 0 && (
                  <div className="pl-4 space-y-0.5 text-xs font-bold text-black">
                    {item.selectedOptions.map((opt, oIdx) => (
                      <p key={oIdx} className="leading-tight">
                        &gt;&gt; {opt.name}
                      </p>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Müşteri / Garson Notu */}
          {data.notes && (
            <div className="py-1.5 border-b-2 border-black border-dashed">
              <span className="font-black text-xs block">SİPARİŞ NOTU:</span>
              <p className="text-xs font-bold italic mt-0.5">
                &ldquo;{data.notes}&rdquo;
              </p>
            </div>
          )}

          {/* Fiş Sonu Bilgisi */}
          <div className="pt-2 text-center text-[10px] font-bold">
            <p>*** SİPARİŞ SONU ***</p>
          </div>
        </div>
      )}

      {/* ==================================================== */}
      {/* B) KASA HESAP ADİSYONU (MÜŞTERİ BİLGİ FİŞİ)          */}
      {/* ==================================================== */}
      {data.type === "bill" && (
        <div className="space-y-2">
          {/* İşletme Başlığı */}
          <div className="text-center pb-2 border-b-2 border-black border-dashed space-y-0.5">
            <h1 className="text-base font-black uppercase tracking-tight">
              {data.cafeName}
            </h1>
            {data.address && <p className="text-[10px]">{data.address}</p>}
            {data.phone && <p className="text-[10px]">Tel: {data.phone}</p>}
            <p className="text-[11px] font-black pt-1">HESAP ADİSYONU</p>
          </div>

          {/* Masa ve Tarih */}
          <div className="flex justify-between items-center py-1.5 border-b border-black text-xs font-black">
            <span className="text-base">MASA: {data.tableNumber}</span>
            <span>{formatDate(data.printedAt || new Date())}</span>
          </div>

          {/* Kalem Başlıkları */}
          <div className="flex justify-between text-[11px] font-black pb-1 border-b border-black border-dashed">
            <span className="w-8">Adet</span>
            <span className="flex-1 text-left px-1">Ürün</span>
            <span className="w-16 text-right">Tutar</span>
          </div>

          {/* Kalem Listesi */}
          <div className="py-1 space-y-1.5 border-b-2 border-black border-dashed text-xs">
            {data.items.map((item, idx) => (
              <div key={idx} className="space-y-0.5">
                <div className="flex justify-between items-start">
                  <span className="w-8 font-black">{item.quantity}x</span>
                  <span className="flex-1 text-left px-1 font-bold">
                    {item.productName}
                    {item.isPaid && (
                      <span className="text-[10px] font-normal block italic">
                        (Önceden Ödendi)
                      </span>
                    )}
                  </span>
                  <span className="w-16 text-right font-black">
                    {item.totalPrice !== undefined
                      ? formatMoney(item.totalPrice)
                      : "-"}
                  </span>
                </div>

                {item.selectedOptions && item.selectedOptions.length > 0 && (
                  <div className="pl-9 text-[10px] space-y-0.5">
                    {item.selectedOptions.map((opt, oIdx) => (
                      <p key={oIdx}>+ {opt.name}</p>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Kısmi Ödeme Varsa Detay */}
          {data.paidAmount && data.paidAmount > 0 && (
            <div className="space-y-1 text-xs pt-1">
              <div className="flex justify-between font-semibold">
                <span>Masa Toplamı:</span>
                <span>{formatMoney(data.totalAmount)}</span>
              </div>
              <div className="flex justify-between text-xs font-bold">
                <span>Ödenen Tutar:</span>
                <span>-{formatMoney(data.paidAmount)}</span>
              </div>
            </div>
          )}

          {/* BÜYÜK PUNTOLARLA GENEL TOPLAM */}
          <div className="py-2.5 my-1 border-y-2 border-black flex justify-between items-baseline">
            <span className="text-sm font-black uppercase">
              {data.paidAmount ? "KALAN BORÇ:" : "GENEL TOPLAM:"}
            </span>
            <span className="text-2xl font-black">
              {formatMoney(data.remainingAmount ?? data.totalAmount)}
            </span>
          </div>

          {/* Ödeme Yöntemi Tercihi */}
          {data.paymentMethod && (
            <p className="text-xs font-bold text-center">
              Ödeme Tercihi: {data.paymentMethod}
            </p>
          )}

          {/* Wi-Fi & Teşekkür */}
          <div className="pt-2 text-center text-[10px] space-y-1 border-t border-black border-dashed">
            {data.wifiSsid && (
              <p className="font-bold">
                Wi-Fi: {data.wifiSsid} | Şifre: {data.wifiPassword || "-"}
              </p>
            )}
            <p className="font-black text-xs pt-1">AFİYET OLSUN!</p>
            <p>Bizi tercih ettiğiniz için teşekkür ederiz.</p>
          </div>
        </div>
      )}
    </div>
  );
}

