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

    try {
      // Doğrudan HTTP API ile çerez yazma garantisi
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        // Çerez yazıldıktan sonra doğrudan yönlendir
        window.location.replace("/admin/dashboard");
        return;
      }

      setError(data.error || "Giriş başarısız.");
      setIsLoading(false);
    } catch {
      // API başarısız olursa Server Action fallback dene
      try {
        const formData = new FormData();
        formData.append("email", email);
        formData.append("password", password);
        const actionRes = await loginAdminAction(null, formData);
        if (actionRes && actionRes.success) {
          window.location.replace("/admin/dashboard");
          return;
        }
        setError(actionRes?.error || "Giriş başarısız.");
      } catch {
        setError("Giriş yapılırken bağlantı hatası oluştu.");
      }
      setIsLoading(false);
    }
  };

  const handleQuickFill = () => {
    setEmail("admin@kafe.com");
    setPassword("admin123");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 p-4 text-slate-900 dark:text-slate-100 font-sans">
      <div className="w-full max-w-sm overflow-hidden rounded-lg bg-white dark:bg-slate-900 shadow-md border border-slate-200 dark:border-slate-800 p-6">
        {/* Kafe Logosu & İkon */}
        <div className="flex flex-col items-center text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-md bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
            <Coffee className="h-6 w-6" />
          </div>
          <h1 className="mt-3 text-lg font-bold tracking-tight text-slate-900 dark:text-slate-100">
            Yönetim Paneli Girişi
          </h1>
          <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
            QR menü ve işletme ayarlarını yönetmek için giriş yapın
          </p>
        </div>

        {/* Hata Bildirimi */}
        {error && (
          <div className="mt-4 flex items-center gap-2 rounded-md bg-rose-50 dark:bg-rose-950/40 p-3 text-xs text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-900/40">
            <AlertCircle className="h-4 w-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="mt-5 space-y-3.5">
          <div>
            <label className="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1">
              Yönetici E-Posta
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@kafe.com"
                className="w-full rounded-md bg-slate-50 dark:bg-slate-800 py-2 pl-9 pr-3 text-xs text-slate-900 dark:text-slate-100 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-1 focus:ring-amber-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1">
              Şifre
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full rounded-md bg-slate-50 dark:bg-slate-800 py-2 pl-9 pr-3 text-xs text-slate-900 dark:text-slate-100 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-1 focus:ring-amber-500"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full mt-2 flex items-center justify-center gap-2 rounded-md bg-amber-600 hover:bg-amber-500 py-2.5 text-xs font-semibold text-white transition-colors disabled:opacity-50 cursor-pointer"
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
        <div className="mt-5 border-t border-slate-100 dark:border-slate-800 pt-3">
          <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
            <span className="flex items-center gap-1">
              <Shield className="h-3.5 w-3.5 text-amber-600" />
              Demo Giriş:
            </span>
            <button
              type="button"
              onClick={handleQuickFill}
              className="font-medium text-amber-600 dark:text-amber-400 hover:underline cursor-pointer"
            >
              admin@kafe.com / admin123 (Doldur)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
