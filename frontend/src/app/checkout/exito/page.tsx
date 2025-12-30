"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";

export default function CheckoutExitoPage() {
  const params = useSearchParams();

  const orderNumber =
    params.get("external_reference") ||
    params.get("merchant_order_id") ||
    params.get("order_id") ||
    "";

  const buyerId = params.get("buyer_id") || params.get("payer_id") || "";
  const amount = params.get("amount") || params.get("total") || "";

  return (
    <div className="min-h-[calc(100vh-140px)] bg-[#FCFAF6] px-6 py-12">
      <div className="mx-auto max-w-5xl">
        <div className="rounded-[28px] bg-[#5C5149] px-6 py-10 md:px-10">
          <div className="mx-auto w-full max-w-4xl rounded-[22px] bg-[#FCFAF6] px-6 py-10 text-center md:px-10">
            {/* ✅ Solo mensaje */}
            <p className="text-sm text-[#333333]">Gracias por tu compra.</p>

            {/* ✅ Imagen */}
            <div className="mt-8 flex justify-center">
              <img
                src="/checkout/pago-exitoso.svg"
                alt="Pago exitoso"
                className="h-auto w-full max-w-[760px]"
              />
            </div>

            {/* ✅ Datos pedidos */}
            {(orderNumber || buyerId || amount) && (
              <div className="mt-8 rounded-xl bg-[#F2EEE8] p-4 text-left text-sm text-[#333333]">
                {orderNumber && (
                  <p>
                    <b>Orden:</b> {orderNumber}
                  </p>
                )}
                {buyerId && (
                  <p>
                    <b>ID comprador:</b> {buyerId}
                  </p>
                )}
                {amount && (
                  <p>
                    <b>Importe:</b> ${amount}
                  </p>
                )}
              </div>
            )}

            <div className="mt-10 flex justify-center">
              <Link
                href="/"
                className="rounded-full bg-[#5F6B58] px-8 py-3 text-sm font-medium text-white hover:opacity-95"
              >
                Continuar comprando
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


