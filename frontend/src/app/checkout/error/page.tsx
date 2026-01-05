"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

function ErrorContent() {
  const params = useSearchParams();

  // 1. Número de Orden
  const orderNumber = 
    params.get("external_reference") || 
    params.get("merchant_order_id") || 
    params.get("order_id") || 
    "N/A";

  // 2. ID de la Transacción Fallida (Útil para reclamos)
  const paymentId = 
    params.get("payment_id") || 
    params.get("collection_id") || 
    "N/A";

  // Opcional: Tipo de error (si MP lo manda)
  const status = params.get("status") || "rechazado";

  return (
    <div className="w-full max-w-3xl bg-white rounded-[32px] shadow-xl overflow-hidden border border-gray-100">
      <div className="px-8 py-12 md:px-12 md:py-16 text-center">
        
        {/* Icono de Error */}
        <div className="mb-6 flex justify-center">
          <div className="h-16 w-16 bg-red-50 rounded-full flex items-center justify-center mb-4 border border-red-100">
            <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
        </div>
        
        <h1 className="text-3xl md:text-4xl font-bold text-[#1a1a1a] mb-3 tracking-tight">
          No pudimos procesar el pago
        </h1>
        <p className="text-gray-500 text-lg mb-10 max-w-lg mx-auto leading-relaxed">
          Hubo un problema con la transacción. No te preocupes, <b>no se te ha cobrado nada</b>. Puedes intentar con otro medio de pago.
        </p>

        {/* Imagen Ilustrativa */}
        <div className="relative w-full h-auto max-w-[400px] mx-auto mb-10 transform hover:scale-105 transition-transform duration-500">
          <img
            src="/checkout/pago-rechazado.svg"
            alt="Pago rechazado"
            className="w-full h-auto drop-shadow-sm opacity-90"
          />
        </div>

        {/* Tarjeta de Detalles (Tipo Ticket de Error) */}
        <div className="bg-red-50 rounded-2xl p-6 md:p-8 max-w-xl mx-auto border border-red-100 mb-8">
          <h3 className="text-xs font-bold text-red-400 uppercase tracking-widest mb-6">
            Detalle del error
          </h3>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-left">
            {/* Bloque Orden */}
            <div className="flex flex-col">
              <span className="text-xs text-gray-500 mb-1">Nº de Orden</span>
              <span className="text-lg font-bold text-[#1a1a1a] break-all">#{orderNumber}</span>
            </div>

            {/* Bloque ID Pago (CORREGIDO) */}
            <div className="flex flex-col sm:items-end">
              <span className="text-xs text-gray-500 mb-1">ID Operación Fallida</span>
              <span className="text-base font-medium text-[#1a1a1a] font-mono break-all bg-white px-2 py-1 rounded border border-red-200 inline-block">
                {paymentId}
              </span>
            </div>
          </div>
          
          <div className="mt-6 pt-4 border-t border-red-200/60 text-xs text-red-600/80 text-center">
            Estado reportado: <span className="font-bold uppercase">{status}</span>
          </div>
        </div>

        {/* Botones de Acción */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center mt-10">
          <Link
            href="/checkout/pago"
            className="inline-flex items-center justify-center px-8 py-4 text-base font-bold text-white transition-all duration-200 bg-[#1a1a1a] rounded-full hover:bg-[#333] shadow-lg hover:shadow-xl hover:-translate-y-1"
          >
            Intentar pagar nuevamente
          </Link>
          <Link
            href="/contacto"
            className="inline-flex items-center justify-center px-8 py-4 text-base font-bold text-[#1a1a1a] bg-white border border-gray-200 rounded-full hover:bg-gray-50 transition-all hover:border-gray-300"
          >
            Reportar problema
          </Link>
        </div>

      </div>
      
      {/* Barra de color inferior (Degradado Rojo) */}
      <div className="h-3 w-full bg-gradient-to-r from-red-500 via-red-400 to-red-500" />
    </div>
  );
}

export default function CheckoutErrorPage() {
  return (
    <div className="min-h-screen bg-[#F2EEE8] flex items-center justify-center px-4 py-12 md:py-20">
      <Suspense fallback={<div className="text-center p-10">Cargando información...</div>}>
        <ErrorContent />
      </Suspense>
    </div>
  );
}