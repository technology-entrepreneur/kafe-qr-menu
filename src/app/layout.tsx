import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Dijital QR Menü | Satış & Dönüşüm Odaklı Kafe Deneyimi",
  description: "Temassız, hızlı ve zengin görsellerle donatılmış yeni nesil akıllı dijital kafe QR menüsü.",
  keywords: ["qr menü", "dijital menü", "kafe menü", "kahve", "tatlı", "temassız menü", "artisan coffee"],
  authors: [{ name: "Artisan Kafe" }],
  manifest: "/manifest.json",
  icons: {
    icon: "/favicon.svg",
    apple: "/favicon.svg",
  },
  openGraph: {
    title: "Dijital QR Menü | Satış & Dönüşüm Odaklı Kafe Deneyimi",
    description: "Temassız, hızlı ve zengin görsellerle donatılmış yeni nesil akıllı dijital kafe QR menüsü.",
    type: "website",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#080706",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="tr" className="dark">
      <body className="min-h-screen antialiased selection:bg-amber-500 selection:text-white font-sans">
        {children}
      </body>
    </html>
  );
}
