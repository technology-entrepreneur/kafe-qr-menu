"use client";

import { useState } from "react";
import { loginAdminAction, AuthActionResult } from "@/actions/auth";
import { Lock, Mail, Coffee, ArrowRight, AlertCircle, Shield } from "lucide-react";

export default function AdminLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const formData = new FormData();
    formData.append("email", email);
    formData.append("password", password);

    try {
      const res = await loginAdminAction(null, formData);
      if (res && res.success) {
        window.location.href = "/admin/dashboard";
        return;
      }
      setError(res?.error || "Giriş başarısız.");
      setIsLoading(false);
    } catch (err: any) {
      setError("Bağlantı hatası oluştu.");
      setIsLoading(false);
    }
  };

  const handleQuickFill = () => {
    setEmail("admin@kafe.com");
    setPassword("admin123");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#faf8f5] dark:bg-[#12100e] p-4 text-stone-900 dark:text-stone-100 font-sans">
      <div className="w-full max-w-md overflow-hidden rounded-3xl bg-white dark:bg-stone-900 shadow-2xl border border-stone-200/80 dark:border-stone-800 p-8">
        {/* Kafe Logosu & İkon */}
        <div className="flex flex-col items-center text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 shadow-inner">
            <Coffee className="h-8 w-8" />
          </div>
          <h1 className="mt-4 text-2xl font-black font-display tracking-tight text-stone-900 dark:text-stone-100">
            Yönetim Paneli Girişi
          </h1>
          <p className="mt-1 text-xs text-stone-500 dark:text-stone-400">
            QR Menü ve Kafe Ayarlarını yönetmek için giriş yapın
          </p>
        </div>

        {/* Hata Bildirimi */}
        {error && (
          <div className="mt-6 flex items-center gap-2 rounded-2xl bg-rose-50 dark:bg-rose-950/40 p-3.5 text-xs text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-900/40">
            <AlertCircle className="h-4 w-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-stone-600 dark:text-stone-300 mb-1.5">
              Yönetici E-Posta
            </label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-400" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@kafe.com"
                className="w-full rounded-2xl bg-stone-50 dark:bg-stone-800/80 py-2.5 pl-10 pr-4 text-sm text-stone-900 dark:text-stone-100 border border-stone-200 dark:border-stone-700 focus:outline-none focus:ring-2 focus:ring-amber-500/50"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-600 dark:text-stone-300 mb-1.5">
              Şifre
            </label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-400" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full rounded-2xl bg-stone-50 dark:bg-stone-800/80 py-2.5 pl-10 pr-4 text-sm text-stone-900 dark:text-stone-100 border border-stone-200 dark:border-stone-700 focus:outline-none focus:ring-2 focus:ring-amber-500/50"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full mt-2 flex items-center justify-center gap-2 rounded-2xl bg-amber-600 hover:bg-amber-700 active:scale-98 py-3 text-sm font-bold text-white shadow-lg shadow-amber-600/20 transition-all disabled:opacity-50"
          >
            {isLoading ? (
              <span>Giriş Yapılıyor...</span>
            ) : (
              <>
                <span>Panele Giriş Yap</span>
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </button>
        </form>

        {/* Test / Geliştirici Kolaylığı */}
        <div className="mt-6 border-t border-stone-100 dark:border-stone-800 pt-4">
          <div className="flex items-center justify-between text-xs text-stone-500 dark:text-stone-400">
            <span className="flex items-center gap-1">
              <Shield className="h-3.5 w-3.5 text-amber-600" />
              Demo Giriş:
            </span>
            <button
              type="button"
              onClick={handleQuickFill}
              className="font-medium text-amber-700 dark:text-amber-400 hover:underline"
            >
              admin@kafe.com / admin123 (Doldur)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
