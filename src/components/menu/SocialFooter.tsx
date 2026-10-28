"use client";

import { Instagram, Phone, MapPin, MessageCircle } from "lucide-react";
import { BusinessSettingsData } from "@/lib/types";

// TikTok İkonu SVG
function TikTokIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64c.29 0 .58.04.86.12V9.42a6.34 6.34 0 0 0-.86-.06 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.34-6.34V8.71a8.18 8.18 0 0 0 4.77 1.52V6.78a4.85 4.85 0 0 1-1-.09z" />
    </svg>
  );
}

interface SocialFooterProps {
  settings: BusinessSettingsData;
}

export default function SocialFooter({ settings }: SocialFooterProps) {
  const whatsappUrl = settings.whatsappNumber
    ? `https://wa.me/${settings.whatsappNumber.replace(/[^0-9]/g, "")}?text=Merhaba,%20kafe%20menünüz%20hakkında%20bilgi%20almak%20istiyorum.`
    : null;

  return (
    <footer className="w-full bg-white dark:bg-stone-900 border-t border-stone-200/80 dark:border-stone-800 pt-8 pb-12 transition-colors">
      <div className="mx-auto max-w-xl px-4 space-y-6">
        {/* Sosyal Medya & İletişim Butonları (Bento Tarzı) */}
        <div className="grid grid-cols-3 gap-2.5">
          {/* Instagram */}
          {settings.instagramUrl ? (
            <a
              href={settings.instagramUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-col items-center justify-center gap-1.5 rounded-2xl bg-stone-50 dark:bg-stone-800/80 p-3 text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-700 hover:text-pink-600 transition-all border border-stone-100 dark:border-stone-700/50"
            >
              <Instagram className="h-5 w-5" />
              <span className="text-[11px] font-semibold">Instagram</span>
            </a>
          ) : null}

          {/* TikTok */}
          {settings.tiktokUrl ? (
            <a
              href={settings.tiktokUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-col items-center justify-center gap-1.5 rounded-2xl bg-stone-50 dark:bg-stone-800/80 p-3 text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-700 hover:text-stone-950 dark:hover:text-white transition-all border border-stone-100 dark:border-stone-700/50"
            >
              <TikTokIcon className="h-5 w-5" />
              <span className="text-[11px] font-semibold">TikTok</span>
            </a>
          ) : null}

          {/* WhatsApp */}
          {whatsappUrl ? (
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-col items-center justify-center gap-1.5 rounded-2xl bg-stone-50 dark:bg-stone-800/80 p-3 text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-700 hover:text-emerald-600 transition-all border border-stone-100 dark:border-stone-700/50"
            >
              <MessageCircle className="h-5 w-5 text-emerald-500" />
              <span className="text-[11px] font-semibold">WhatsApp</span>
            </a>
          ) : null}
        </div>

        {/* Adres ve Telefon */}
        <div className="space-y-2 text-center text-xs text-stone-500 dark:text-stone-400">
          {settings.address && (
            <div className="flex items-center justify-center gap-1.5">
              <MapPin className="h-3.5 w-3.5 text-stone-400 flex-shrink-0" />
              <span>{settings.address}</span>
            </div>
          )}

          {settings.phone && (
            <div className="flex items-center justify-center gap-1.5">
              <Phone className="h-3.5 w-3.5 text-stone-400 flex-shrink-0" />
              <a href={`tel:${settings.phone}`} className="hover:underline">
                {settings.phone}
              </a>
            </div>
          )}
        </div>

        {/* Alt Telif */}
        <div className="border-t border-stone-100 dark:border-stone-800/60 pt-4 text-center">
          <p className="text-[11px] text-stone-400 dark:text-stone-500">
            © {new Date().getFullYear()} {settings.cafeName} • Dijital QR Menü Sistemi
          </p>
        </div>
      </div>
    </footer>
  );
}
