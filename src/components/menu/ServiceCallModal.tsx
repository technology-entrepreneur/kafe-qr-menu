"use client";

import React, { useState, useEffect } from "react";
import {
  Bell,
  CreditCard,
  Banknote,
  Users2,
  X,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Clock,
  Flame,
  Star,
  ExternalLink,
} from "lucide-react";
import { Language } from "@/types/menu";

interface ServiceCallModalProps {
  isOpen: boolean;
  onClose: () => void;
  tableNumber: string;
  sessionId?: string | null;
  language?: Language;
  hookahMode?: boolean;
  googleReviewUrl?: string | null;
  enableGoogleReviewPrompt?: boolean;
  onOpenBillSplit?: () => void;
}

type CallMode = "waiter" | "bill" | "coal";
type PaymentMethod = "cash" | "card" | "split";

export default function ServiceCallModal({
  isOpen,
  onClose,
  tableNumber,
  sessionId,
  language = "tr",
  hookahMode = false,
  googleReviewUrl,
  enableGoogleReviewPrompt = true,
  onOpenBillSplit,
}: ServiceCallModalProps) {
  const isEn = language === "en";

  const [mode, setMode] = useState<CallMode>("waiter");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("card");
  const [note, setNote] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [cooldownSeconds, setCooldownSeconds] = useState(0);

  useEffect(() => {
    if (cooldownSeconds <= 0) return;
    const timer = setInterval(() => {
      setCooldownSeconds((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [cooldownSeconds]);

  const handleSubmit = async () => {
    if (cooldownSeconds > 0) return;
    setIsSubmitting(true);
    setErrorMessage(null);

    let callType = "waiter";
    if (mode === "coal") {
      callType = "hookah_coal";
    } else if (mode === "bill") {
      callType =
        paymentMethod === "cash"
          ? "bill_cash"
          : paymentMethod === "card"
          ? "bill_card"
          : "bill_split";
    }

    const paymentNoteText =
      mode === "bill"
        ? paymentMethod === "cash"
          ? "Nakit Ödeme"
          : paymentMethod === "card"
          ? "Kredi Kartı / POS"
          : "Alman Usulü"
        : mode === "coal"
        ? "Köz Yenileme Talebi"
        : undefined;

    try {
      let activeSessionId = sessionId;
      if (!activeSessionId) {
        const sessRes = await fetch(
          `/api/sessions/${encodeURIComponent(tableNumber)}`,
          { cache: "no-store" }
        );
        if (sessRes.ok) {
          const sData = await sessRes.json();
          if (sData.session?.id) activeSessionId = sData.session.id;
        }
      }

      const res = await fetch("/api/service-calls", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId: activeSessionId || `temp_${tableNumber}`,
          tableNumber,
          type: callType,
          notes: note.trim() || undefined,
          paymentNote: paymentNoteText,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        if (res.status === 429 && data.cooldownRemaining) {
          setCooldownSeconds(data.cooldownRemaining);
          throw new Error(
            isEn
              ? `Please wait ${data.cooldownRemaining}s before sending another call.`
              : `Lütfen tekrar çağrı göndermeden önce ${data.cooldownRemaining} saniye bekleyiniz.`
          );
        }
        throw new Error(data.error || (isEn ? "Failed to send call" : "Çağrı iletilemedi"));
      }

      setIsSuccess(true);
      setCooldownSeconds(mode === "coal" ? 600 : 90);

      const closeTimeout = mode === "bill" && enableGoogleReviewPrompt && googleReviewUrl ? 4000 : 2000;
      setTimeout(() => {
        setIsSuccess(false);
        onClose();
        setNote("");
      }, closeTimeout);
    } catch (err: any) {
      setErrorMessage(
        err.message ||
          (isEn
            ? "Could not reach staff. Please call a server directly."
            : "Çağrı iletilemedi. Lütfen servis personeline bilgi veriniz.")
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        onClick={onClose}
        className="fixed inset-0 bg-black/60"
      />

      <div className="relative w-full max-w-sm rounded-lg bg-slate-900 border border-slate-800 text-slate-100 shadow-xl p-5 z-10 font-sans">
        <button
          type="button"
          onClick={onClose}
          className="absolute right-3.5 top-3.5 p-1 rounded text-slate-400 hover:text-white transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        {isSuccess ? (
          <div className="py-6 flex flex-col items-center text-center space-y-3">
            <div className="w-10 h-10 rounded bg-emerald-950 border border-emerald-800 flex items-center justify-center text-emerald-400">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white">
              {mode === "waiter"
                ? isEn ? "Staff Notified" : "Garsona İletildi"
                : mode === "coal"
                ? isEn ? "Coal Requested" : "Köz Talebi İletildi"
                : isEn ? "Bill Requested" : "Hesap İsteği İletildi"}
            </h3>
            <p className="text-xs text-slate-400 max-w-xs leading-relaxed">
              Masa {tableNumber} çağrısı ilgili ekrana iletildi.
            </p>

            {mode === "bill" && enableGoogleReviewPrompt && googleReviewUrl && (
              <div className="w-full mt-3 p-3 rounded bg-slate-950 border border-slate-800 text-left flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-0.5 text-amber-500">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <Star key={i} className="w-3 h-3 fill-current" />
                    ))}
                  </div>
                  <p className="text-xs font-medium text-white mt-0.5">
                    Google Haritalar Puanı
                  </p>
                </div>

                <a
                  href={googleReviewUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium text-xs flex items-center gap-1 transition-colors"
                >
                  <span>Puanla</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <span className="text-[10px] font-semibold text-slate-400 bg-slate-800 border border-slate-700 px-2 py-0.5 rounded">
                Masa {tableNumber}
              </span>
              <h3 className="text-base font-bold text-white mt-1.5">
                {isEn ? "Service Call" : "Masa Hizmet Talebi"}
              </h3>
            </div>

            {/* Sekmeler */}
            <div className={`grid p-0.5 rounded bg-slate-950 border border-slate-800 ${hookahMode ? "grid-cols-3" : "grid-cols-2"}`}>
              <button
                type="button"
                onClick={() => {
                  setMode("waiter");
                  setErrorMessage(null);
                }}
                className={`py-1.5 rounded text-xs font-medium flex items-center justify-center gap-1.5 transition-colors ${
                  mode === "waiter"
                    ? "bg-slate-800 text-white"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                <Bell className="w-3.5 h-3.5" />
                <span>{isEn ? "Staff" : "Garson"}</span>
              </button>

              {hookahMode && (
                <button
                  type="button"
                  onClick={() => {
                    setMode("coal");
                    setErrorMessage(null);
                  }}
                  className={`py-1.5 rounded text-xs font-medium flex items-center justify-center gap-1.5 transition-colors ${
                    mode === "coal"
                      ? "bg-slate-800 text-white"
                      : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  <Flame className="w-3.5 h-3.5 text-purple-400" />
                  <span>{isEn ? "Coal" : "Köz İste"}</span>
                </button>
              )}

              <button
                type="button"
                onClick={() => {
                  setMode("bill");
                  setErrorMessage(null);
                }}
                className={`py-1.5 rounded text-xs font-medium flex items-center justify-center gap-1.5 transition-colors ${
                  mode === "bill"
                    ? "bg-slate-800 text-white"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                <CreditCard className="w-3.5 h-3.5" />
                <span>{isEn ? "Bill" : "Hesap"}</span>
              </button>
            </div>

            {/* Köz İste Bilgilendirmesi */}
            {mode === "coal" && (
              <div className="p-2.5 rounded bg-slate-950 border border-slate-800 text-xs text-slate-400">
                Taze köz talebiniz nargile istasyonuna iletilecektir.
              </div>
            )}

            {/* Hesap İsteme Seçenekleri */}
            {mode === "bill" && (
              <div className="space-y-2">
                <label className="text-xs font-medium text-slate-300">
                  {isEn ? "Payment Method:" : "Ödeme Tercihi:"}
                </label>
                <div className="grid grid-cols-3 gap-1.5">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod("card")}
                    className={`p-2 rounded border text-center flex flex-col items-center gap-1 transition-colors ${
                      paymentMethod === "card"
                        ? "bg-slate-800 border-slate-600 text-white font-medium"
                        : "bg-slate-950 border-slate-800 text-slate-400"
                    }`}
                  >
                    <CreditCard className="w-4 h-4" />
                    <span className="text-[11px]">Kredi Kartı</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod("cash")}
                    className={`p-2 rounded border text-center flex flex-col items-center gap-1 transition-colors ${
                      paymentMethod === "cash"
                        ? "bg-slate-800 border-slate-600 text-white font-medium"
                        : "bg-slate-950 border-slate-800 text-slate-400"
                    }`}
                  >
                    <Banknote className="w-4 h-4" />
                    <span className="text-[11px]">Nakit</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setPaymentMethod("split");
                      if (onOpenBillSplit) {
                        onClose();
                        onOpenBillSplit();
                      }
                    }}
                    className={`p-2 rounded border text-center flex flex-col items-center gap-1 transition-colors ${
                      paymentMethod === "split"
                        ? "bg-slate-800 border-slate-600 text-white font-medium"
                        : "bg-slate-950 border-slate-800 text-slate-400"
                    }`}
                  >
                    <Users2 className="w-4 h-4" />
                    <span className="text-[11px]">Alman Usulü</span>
                  </button>
                </div>
              </div>
            )}

            {/* Not */}
            {mode !== "coal" && (
              <div>
                <label className="text-xs font-medium text-slate-300 block mb-1">
                  {mode === "waiter" ? "Not (isteğe bağlı):" : "Fatura / Hesap notu:"}
                </label>
                <input
                  type="text"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder={mode === "waiter" ? "Örn: Peçete rica ediyoruz..." : "Örn: Kurumsal fatura..."}
                  maxLength={100}
                  className="w-full rounded bg-slate-950 border border-slate-800 py-1.5 px-2.5 text-xs text-white placeholder-slate-500"
                />
              </div>
            )}

            {errorMessage && (
              <div className="p-2 rounded bg-rose-950/60 border border-rose-800 text-xs text-rose-300 flex items-center gap-1.5">
                <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            <button
              type="button"
              onClick={handleSubmit}
              disabled={isSubmitting || cooldownSeconds > 0}
              className="w-full py-2 rounded font-medium text-xs flex items-center justify-center gap-1.5 transition-colors bg-amber-600 hover:bg-amber-500 text-slate-950 disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>İletiliyor...</span>
                </>
              ) : cooldownSeconds > 0 ? (
                <>
                  <Clock className="w-3.5 h-3.5" />
                  <span>Bekleyin ({cooldownSeconds}s)</span>
                </>
              ) : (
                <span>
                  {mode === "waiter"
                    ? "Garson Çağır"
                    : mode === "coal"
                    ? "Köz İste"
                    : "Hesap İste"}
                </span>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
