"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

function PendienteContent() {
  const params = useSearchParams();

  const orderNumber = params.get("external_reference") || "N/A";
  const paymentId = params.get("payment_id") || "N/A";

  return (
    <div className="w-full max-w-3xl bg-white rounded-[32px] shadow-xl overflow-hidden border border-gray-100">
      <div className="px-8 py-12 md:px-12 md:py-16 text-center">
        
        {/* 1. Icono de Reloj/Espera */}
        <div className="mb-6 flex justify-center">
          <div className="h-16 w-16 bg-amber-50 rounded-full flex items-center justify-center mb-4 animate-pulse">
            <svg className="w-8 h-8 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        </div>
        
        <h1 className="text-3xl md:text-4xl font-bold text-[#1a1a1a] mb-3 tracking-tight">
          Pago en proceso...
        </h1>
        <p className="text-gray-500 text-lg mb-10 max-w-lg mx-auto leading-relaxed">
          Tu pago se está procesando. En cuanto se confirme (puede tardar unos minutos o hasta 24hs si pagaste en efectivo), te avisaremos por email.
        </p>

        {/* 2. Imagen (Pago Pendiente) */}
        <div className="relative w-full h-auto max-w-[400px] mx-auto mb-10 hover:scale-105 transition-transform duration-500">
           <img
            src="/checkout/pago-pendiente.svg"
            alt="Pago pendiente"
            className="w-full h-auto drop-shadow-sm"
          />
        </div>

        {/* 3. Tarjeta Informativa */}
        <div className="bg-[#F9F7F2] rounded-2xl p-6 max-w-xl mx-auto border border-[#EBE5D9] mb-8">
           <div className="flex flex-col sm:flex-row justify-between items-center gap-4 text-sm">
              <div className="flex flex-col items-center sm:items-start">
                 <span className="text-gray-400 font-bold uppercase text-[10px] tracking-widest">Nº Orden</span>
                 <span className="font-bold text-lg text-[#1a1a1a]">#{orderNumber}</span>
              </div>
              <div className="flex flex-col items-center sm:items-end">
                 <span className="text-gray-400 font-bold uppercase text-[10px] tracking-widest">Estado Actual</span>
                 <span className="bg-amber-100 text-amber-700 px-3 py-1 rounded-full font-bold text-xs mt-1">
                   ⏳ Pendiente de acreditación
                 </span>
              </div>
           </div>
           <div className="mt-4 pt-4 border-t border-gray-200 text-xs text-gray-500">
             Por favor <b>no vuelvas a comprar</b> el mismo producto hasta que recibas la confirmación final.
           </div>
        </div>

        {/* 4. Botón de Acción */}
        <div className="mt-8">
          <Link
            href="/"
            className="inline-flex items-center justify-center px-10 py-4 text-base font-bold text-white transition-all duration-200 bg-[#1a1a1a] rounded-full hover:bg-[#333] hover:-translate-y-1 shadow-lg"
          >
            Volver a la tienda
          </Link>
        </div>

      </div>
      
      {/* Barra de color inferior (Amarilla/Ámbar) */}
      <div className="h-3 w-full bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500" />
    </div>
  );
}

export default function CheckoutPendientePage() {
  return (
    <div className="min-h-screen bg-[#F2EEE8] flex items-center justify-center px-4 py-12 md:py-20">
      <Suspense fallback={<div className="text-center p-10">Verificando estado...</div>}>
        <PendienteContent />
      </Suspense>
    </div>
  );
}