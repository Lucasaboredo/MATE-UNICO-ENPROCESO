"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import Stepper from "@/components/stepper/Stepper";
import { useCart } from "@/lib/cartContext";
import { useCheckout } from "@/lib/checkoutContext";
import type { CartItem } from "@/types/cart";

export default function CheckoutPagoPage() {
  const router = useRouter();

  const { items, total, clearCart } = useCart();
  const { buyer, shipping } = useCheckout();

  const [msg, setMsg] = useState<string | null>(null);

  // 🚫 Si no hay datos mínimos, reencaminar
  if (!buyer.email) {
    router.push("/checkout/datos");
    return null;
  }

  if (!shipping.codigoPostal) {
    router.push("/checkout/envio");
    return null;
  }

  if (!items || items.length === 0) {
    router.push("/carrito");
    return null;
  }

  const envio = Number(shipping.costoEnvio ?? 0);
  const totalFinal = Number(total) + envio;

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
      items: (items as CartItem[]).map((i) => ({
        productId: i.productId,
        variantId: i.variantId,
        nombre: i.nombre,
        slug: i.slug,
        precioUnitario: i.precioUnitario,
        cantidad: i.cantidad,
      })),
      subtotal: Number(total),
      total: totalFinal,
    };
  }, [buyer, shipping, items, total, totalFinal]);

  function handleConfirm() {
    // 🚧 Esto lo va a conectar Joaco al POST real a Strapi.
    console.log("✅ Payload listo para crear orden:", payload);

    setMsg("Pedido listo. Falta conectar la creación de orden (Joaco).");

    // Si quieren simular “fin de compra” en frontend:
    // clearCart();
    // router.push("/carrito");
  }

  return (
    <div className="mx-auto max-w-6xl px-6 py-10">
      <Stepper currentStep={4} />

      <div className="mt-10 grid gap-10 md:grid-cols-[1fr_420px]">
        {/* Pago (placeholder) */}
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

          {msg && <p className="mt-4 text-sm text-[#333333]">{msg}</p>}

          <button
            onClick={handleConfirm}
            className="mt-6 w-full rounded-2xl bg-[#5F6B58] px-6 py-3 font-medium text-white hover:opacity-95"
          >
            Confirmar compra
          </button>
        </section>

        {/* Resumen final */}
        <aside className="rounded-2xl bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-[#333333]">Resumen</h2>

          <div className="mt-4 space-y-3">
            {(items as CartItem[]).map((item) => {
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

          {/* Debug opcional: para Joaco */}
          <details className="mt-6 rounded-xl border p-3 text-xs text-[#5C5149]">
            <summary className="cursor-pointer">Ver payload (para dev)</summary>
            <pre className="mt-2 whitespace-pre-wrap break-words">
              {JSON.stringify(payload, null, 2)}
            </pre>
          </details>
        </aside>
      </div>
    </div>
  );
}
