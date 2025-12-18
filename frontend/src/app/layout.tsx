// src/app/layout.tsx

import "./globals.css";
import type { ReactNode } from "react";
import type { Metadata } from "next";
import { Inter } from "next/font/google"; // 1. Importamos la fuente

import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

// 2. Configuramos la fuente Inter
const inter = Inter({ subsets: ["latin"] });

/* ================= METADATA (Pestaña navegador) ================= */
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
      {/* 3. Aplicamos la clase de la fuente al body */}
      <body className={inter.className}>
        <Header />

        {/* AGREGAMOS PADDING PARA QUE EL HEADER FIJO NO TAPE EL CONTENIDO */}
        <main className="pt-[140px]">
          {children}
        </main>

        <Footer />
      </body>
    </html>
  );
}