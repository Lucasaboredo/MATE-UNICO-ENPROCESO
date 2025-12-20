import "./globals.css";
import type { ReactNode } from "react";
import type { Metadata } from "next";
import { Inter } from "next/font/google";

import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { CartProvider } from "@/lib/cartContext"; // ✅ NUEVO

// Fuente
const inter = Inter({ subsets: ["latin"] });

/* ================= METADATA ================= */
export const metadata: Metadata = {
  title: {
    default: "Mate Único",
    template: "%s | Mate Único",
  },
  description: "Mate Único – Mates artesanales y personalizados",
  icons: {
    icon: [
      {
        url: "/logo-mate.svg",
        type: "image/svg+xml",
      },
    ],
  },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="es">
      <body className={inter.className}>
        {/* ✅ PROVIDER GLOBAL */}
        <CartProvider>
          <Header />

          {/* Padding para header fijo */}
          <main className="pt-[140px]">
            {children}
          </main>

          <Footer />
        </CartProvider>
      </body>
    </html>
  );
}
