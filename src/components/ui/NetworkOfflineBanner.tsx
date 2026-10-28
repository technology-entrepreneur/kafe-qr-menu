"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { WifiOff, Wifi, RefreshCw } from "lucide-react";
import { useNetworkStatus } from "@/lib/hooks/useNetworkStatus";

export default function NetworkOfflineBanner() {
  const { isOnline, wasOffline } = useNetworkStatus();
  const [showRestored, setShowRestored] = useState(false);

  useEffect(() => {
    if (isOnline && wasOffline) {
      setShowRestored(true);
      const timer = setTimeout(() => {
        setShowRestored(false);
      }, 3500);
      return () => clearTimeout(timer);
    }
  }, [isOnline, wasOffline]);

  return (
    <aside aria-label="Ağ Durumu Bildirimleri">
      <AnimatePresence>
        {!isOnline && (
          <motion.div
            initial={{ y: -40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -40, opacity: 0 }}
            role="status"
            aria-live="polite"
            className="fixed top-0 inset-x-0 z-50 bg-rose-600 text-white py-2 px-4 text-xs font-semibold shadow-lg flex items-center justify-center gap-2"
          >
            <WifiOff className="w-3.5 h-3.5 animate-pulse" />
            <span>
              İnternet bağlantınız koptu. Menüyü önbellekten görüntülüyorsunuz.
            </span>
          </motion.div>
        )}

        {showRestored && isOnline && (
          <motion.div
            initial={{ y: -40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -40, opacity: 0 }}
            role="status"
            aria-live="polite"
            className="fixed top-0 inset-x-0 z-50 bg-emerald-600 text-white py-2 px-4 text-xs font-semibold shadow-lg flex items-center justify-center gap-2"
          >
            <Wifi className="w-3.5 h-3.5" />
            <span>Bağlantı tekrar sağlandı! Menü güncellendi.</span>
          </motion.div>
        )}
      </AnimatePresence>
    </aside>
  );
}
