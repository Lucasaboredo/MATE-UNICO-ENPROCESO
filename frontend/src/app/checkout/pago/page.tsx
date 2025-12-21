"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import Stepper from "@/components/stepper/Stepper";
import { useCart } from "@/lib/cartContext";
import { useCheckout } from "@/lib/checkoutContext";
import type { CartItem } from "@/types/cart";
import { fetchFromStrapi } from "@/lib/api";

export default function CheckoutPagoPage() {
  const router = useRouter();

  // 1️⃣ HOOKS PRIMERO (Siempre arriba para evitar errores de React)
  const { items, total, clearCart } = useCart();
  const { buyer, shipping } = useCheckout();

  const [msg, setMsg] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // Calculamos valores derivados
  const envio = Number(shipping.costoEnvio ?? 0);
  const totalFinal = Number(total) + envio;

  // 2️⃣ USEMEMO (Siempre se ejecuta antes de cualquier return)
  const payload = useMemo(() => {
    return {
      buyer: {
        nombre: buyer.nombre,
        apellido: buyer.apellido,
        email: buyer.email,
        telefono: buyer.telefono,
      },
      shipping: {
        calle: shipping.calle,
        numero: shipping.numero,
        ciudad: shipping.ciudad,
        provincia: shipping.provincia,
        codigoPostal: shipping.codigoPostal,
        metodoEnvio: shipping.metodoEnvio,
        costoEnvio: shipping.costoEnvio,
      },
      // Mapeamos items asegurándonos que sea un array para evitar crashes
      items: (items || []).map((i) => ({
        productId: i.productId,
        variantId: i.variantId,
        nombre: i.nombre,
        slug: i.slug,
        precioUnitario: i.precioUnitario,
        cantidad: i.cantidad,
      })),
      total: totalFinal,

      // 👇 ACÁ ESTÁ EL CAMBIO CLAVE: Usamos "cliente" (el nombre que le pusiste en Strapi)
      cliente: 1
    };
  }, [buyer, shipping, items, total, totalFinal]);

  // 3️⃣ VALIDACIONES Y REDIRECTS (En useEffect para no bloquear el render)
  useEffect(() => {
    // Si estamos procesando o acabamos de terminar (msg existe), no redirigimos todavía
    if (isProcessing || msg) return;

    if (!buyer.email) {
      router.push("/checkout/datos");
    } else if (!shipping.codigoPostal) {
      router.push("/checkout/envio");
    } else if (!items || items.length === 0) {
      router.push("/carrito");
    }
  }, [buyer, shipping, items, router, isProcessing, msg]);

  // 4️⃣ FUNCIÓN DE CONFIRMACIÓN
  async function handleConfirm() {
    setIsProcessing(true);
    setMsg(null);
    console.log("🚀 Enviando orden a Strapi...", payload);

    try {
      // Usamos /ordens porque ese es el plural que generó tu Strapi
      const response = await fetchFromStrapi("/ordens", {
        method: "POST",
        body: JSON.stringify({ data: payload }),
      });

      console.log("✅ Orden creada con éxito:", response);

      // Limpiamos carrito y mostramos mensaje
      clearCart();
      setMsg("¡Compra realizada con éxito! Redirigiendo...");

      setTimeout(() => {
        router.push("/");
      }, 2000);

    } catch (error) {
      console.error("❌ Error creando la orden:", error);
      setMsg("Hubo un error al procesar tu pedido. Intenta nuevamente.");
      setIsProcessing(false); // Solo desbloqueamos si falló
    }
  }

  // 5️⃣ RENDER CONDICIONAL (Al final de todo)
  // Si falta info crítica y NO estamos mostrando el mensaje de éxito, retornamos null
  if ((!buyer.email || !shipping.codigoPostal || !items || items.length === 0) && !msg) {
    return null;
  }

  return (
    <div className="mx-auto max-w-6xl px-6 py-10">
      <Stepper currentStep={4} />

      <div className="mt-10 grid gap-10 md:grid-cols-[1fr_420px]">
        {/* Sección de Pago */}
        <section className="rounded-2xl bg-[#FCFAF6] p-6 shadow-sm">
          <h1 className="text-xl font-semibold text-[#333333]">Pago</h1>
          <p className="mt-2 text-sm text-[#5C5149]">
            Esta pantalla es un placeholder. Más adelante se integra la pasarela de pago.
          </p>

          <div className="mt-6 space-y-4 rounded-2xl bg-white p-4">
            <div>
              <p className="text-sm font-semibold text-[#333333]">Comprador</p>
              <p className="text-sm text-[#5C5149]">
                {buyer.nombre} {buyer.apellido}
              </p>
              <p className="text-sm text-[#5C5149]">{buyer.email}</p>
              <p className="text-sm text-[#5C5149]">{buyer.telefono}</p>
            </div>

            <div className="border-t pt-4">
              <p className="text-sm font-semibold text-[#333333]">Envío</p>
              <p className="text-sm text-[#5C5149]">
                {shipping.calle} {shipping.numero}
              </p>
              <p className="text-sm text-[#5C5149]">
                {shipping.ciudad}, {shipping.provincia}
              </p>
              <p className="text-sm text-[#5C5149]">CP: {shipping.codigoPostal}</p>
              <p className="text-sm text-[#5C5149]">
                Método: {shipping.metodoEnvio ?? "standard"}
              </p>
            </div>
          </div>

          {msg && (
            <div className={`mt-4 rounded-lg p-3 text-sm font-medium ${msg.includes("error") ? "bg-red-50 text-red-600" : "bg-green-50 text-green-600"}`}>
              {msg}
            </div>
          )}

          <button
            onClick={handleConfirm}
            disabled={isProcessing}
            className="mt-6 w-full rounded-2xl bg-[#5F6B58] px-6 py-3 font-medium text-white hover:opacity-95 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            {isProcessing ? "Procesando..." : "Confirmar compra"}
          </button>
        </section>

        {/* Resumen final */}
        <aside className="rounded-2xl bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-[#333333]">Resumen</h2>

          <div className="mt-4 space-y-3">
            {(items || []).map((item) => {
              const key = `${item.productId}-${item.variantId ?? "noVar"}`;
              const lineTotal = item.precioUnitario * item.cantidad;

              return (
                <div key={key} className="flex justify-between text-sm">
                  <div>
                    <p className="font-medium text-[#333333]">{item.nombre}</p>
                    <p className="text-[#5C5149]">x{item.cantidad}</p>
                  </div>
                  <p className="font-medium text-[#333333]">
                    ${lineTotal.toLocaleString("es-AR")}
                  </p>
                </div>
              );
            })}
          </div>

          <div className="mt-6 space-y-2 border-t pt-4 text-sm">
            <div className="flex justify-between">
              <span className="text-[#5C5149]">Subtotal</span>
              <span className="text-[#333333]">${Number(total).toLocaleString("es-AR")}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#5C5149]">Envío</span>
              <span className="text-[#333333]">${envio.toLocaleString("es-AR")}</span>
            </div>
            <div className="flex justify-between pt-2 text-base font-semibold">
              <span className="text-[#333333]">Total</span>
              <span className="text-[#333333]">${totalFinal.toLocaleString("es-AR")}</span>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}