"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import Stepper from "@/components/stepper/Stepper";
import { useCart } from "@/lib/cartContext";
import { useCheckout } from "@/lib/checkoutContext";
import { fetchFromStrapi } from "@/lib/api";
import { useAuth } from "@/lib/authContext"; // <--- 1. IMPORTAMOS AUTH

/* ================= STRAPI HOST ================= */
const STRAPI_HOST =
  process.env.NEXT_PUBLIC_API_URL?.replace("/api", "") ||
  process.env.NEXT_PUBLIC_STRAPI_URL ||
  "http://localhost:1337";

function toAbsoluteUrl(url?: string | null) {
  if (!url) return "";
  if (url.startsWith("http")) return url;
  if (url.startsWith("/")) return `${STRAPI_HOST}${url}`;
  return `${STRAPI_HOST}/${url}`;
}

/* ================= IMAGEN SEGURA ================= */
function getImageFromCartItem(item: any): string {
  const direct =
    item?.imagenUrl ||
    item?.imageUrl ||
    item?.thumbnail ||
    item?.img ||
    item?.imagen;

  if (typeof direct === "string" && direct) return toAbsoluteUrl(direct);

  const strapiSingle =
    item?.imagen?.data?.attributes?.url ||
    item?.image?.data?.attributes?.url;
  if (strapiSingle) return toAbsoluteUrl(strapiSingle);

  const strapiMulti =
    item?.imagen?.data?.[0]?.attributes?.url ||
    item?.images?.data?.[0]?.attributes?.url;
  if (strapiMulti) return toAbsoluteUrl(strapiMulti);

  return "/placeholder-mate.png";
}

export default function CheckoutPagoPage() {
  const router = useRouter();

  const { items, clearCart } = useCart();
  const { buyer, shipping } = useCheckout();
  const { user } = useAuth(); // <--- 2. OBTENEMOS EL USUARIO LOGUEADO

  /* ================= ENVÍO ================= */
  const [envioPrecio, setEnvioPrecio] = useState(0);
  const [envioDemora, setEnvioDemora] = useState<string | null>(null);

  /* ================= CUPÓN ================= */
  const [codigoCupon, setCodigoCupon] = useState("");
  const [descuento, setDescuento] = useState(0);
  const [cuponMsg, setCuponMsg] = useState<string | null>(null);
  const [aplicandoCupon, setAplicandoCupon] = useState(false);
  const cuponAplicado = descuento > 0;

  /* ================= UI ================= */
  const [msg, setMsg] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  /* ================= VALIDACIONES ================= */
  useEffect(() => {
    if (!buyer?.email) router.push("/checkout/datos");
    else if (!shipping?.codigoPostal) router.push("/checkout/envio");
    else if (!items || items.length === 0) router.push("/carrito");
  }, [buyer, shipping, items, router]);

  /* ================= CALCULAR ENVÍO ================= */
  useEffect(() => {
    async function calcularEnvio() {
      if (!shipping?.codigoPostal) return;

      const res = await fetch("/api/shipping", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cp: shipping.codigoPostal }),
      });

      const data = await res.json();
      setEnvioPrecio(Number(data.price ?? 0));
      setEnvioDemora(data.delay ?? null);
    }

    calcularEnvio();
  }, [shipping?.codigoPostal]);

  /* ================= SUBTOTAL ================= */
  const subtotal = useMemo(() => {
    return (items || []).reduce((acc: number, item: any) => {
      return (
        acc +
        Number(item.precioUnitario ?? 0) *
        Number(item.cantidad ?? 1)
      );
    }, 0);
  }, [items]);

  /* ================= TOTALES ================= */
  const totalBase = subtotal + envioPrecio;
  const totalPagar = Math.max(totalBase - descuento, 0);

  /* ================= APLICAR CUPÓN ================= */
  async function aplicarCupon() {
    if (!codigoCupon) return;

    setAplicandoCupon(true);
    setCuponMsg(null);

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/cupones/validar`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            codigo: codigoCupon,
            total: totalBase, // productos + envío
          }),
        }
      );

      const data = await res.json();
      if (!res.ok) throw new Error();

      setDescuento(Math.max(Number(data.descuento) || 0, 0));
      setCuponMsg("Cupón aplicado correctamente");
    } catch {
      setDescuento(0);
      setCuponMsg("Cupón inválido");
    } finally {
      setAplicandoCupon(false);
    }
  }

  /* ================= CONFIRMAR PAGO ================= */
  async function handleConfirm() {
    setIsProcessing(true);
    setMsg(null);

    try {
      // 1️⃣ Crear orden en Strapi
      const orden = await fetchFromStrapi("/ordens", {
        method: "POST",
        body: JSON.stringify({
          data: {
            buyer,
            shipping: {
              ...shipping,
              costoEnvio: envioPrecio,
            },
            items,
            total: totalPagar,
            // 👇 AQUÍ LA MAGIA: Si hay usuario, vinculamos la orden con él
            cliente: user?.id || null,
          },
        }),
      });

      const orderId = orden.data.id;

      // 2️⃣ Factor de descuento proporcional
      const factor =
        descuento > 0 && totalBase > 0
          ? descuento / totalBase
          : 0;

      // 3️⃣ Items Mercado Pago
      const mpItems: any[] = items.map((item: any) => ({
        title: item.nombre,
        quantity: item.cantidad,
        unit_price:
          Number(item.precioUnitario) * (1 - factor),
      }));

      if (envioPrecio > 0) {
        mpItems.push({
          title: "Envío",
          quantity: 1,
          unit_price: envioPrecio * (1 - factor),
        });
      }

      const mpRes = await fetch("/api/pagos/preferencia", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId, items: mpItems }),
      });

      const mpData = await mpRes.json();
      if (!mpData.init_point) throw new Error();

      clearCart();
      window.location.href = mpData.init_point;
    } catch (err) {
      console.error(err);
      setMsg("Hubo un error al iniciar el pago");
      setIsProcessing(false);
    }
  }

  if (!items || items.length === 0) return null;

  /* ================= RENDER ================= */
  return (
    <div className="min-h-[calc(100vh-140px)] bg-[#FAF7F2]">
      <div className="mx-auto max-w-5xl px-6 py-12">
        <Stepper currentStep={4} />

        {/* PRODUCTOS */}
        <div className="mt-12 space-y-5">
          {items.map((item: any) => (
            <div
              key={`${item.productId}-${item.variantId}`}
              className="flex items-center justify-between rounded-2xl bg-[#6B5E54] px-6 py-5 text-white"
            >
              <div className="flex items-center gap-4">
                <img
                  src={getImageFromCartItem(item)}
                  className="h-16 w-16 rounded-xl object-cover"
                />
                <div>
                  <p className="font-medium">{item.nombre}</p>
                  <p className="text-xs">
                    Cantidad: {item.cantidad}
                  </p>
                </div>
              </div>

              <div className="text-right text-sm">
                ${(item.precioUnitario * item.cantidad).toLocaleString("es-AR")}
              </div>
            </div>
          ))}
        </div>

        {/* CUPÓN */}
        <div className="mt-10 flex flex-col gap-2">
          <div className="flex items-center gap-3">
            <input
              value={codigoCupon}
              disabled={cuponAplicado || aplicandoCupon}
              onChange={(e) =>
                setCodigoCupon(e.target.value.toUpperCase())
              }
              placeholder="CÓDIGO DE CUPÓN"
              className="rounded-full bg-[#E5DED6] px-5 py-2 text-xs"
            />

            {cuponAplicado ? (
              <span className="rounded-full bg-[#4F7A55] px-4 py-2 text-xs text-white">
                APLICADO
              </span>
            ) : (
              <button
                onClick={aplicarCupon}
                disabled={aplicandoCupon}
                className="rounded-full bg-[#6B5E54] px-5 py-2 text-xs text-white"
              >
                {aplicandoCupon ? "Aplicando..." : "Aplicar"}
              </button>
            )}
          </div>

          {cuponMsg && (
            <span
              className={`text-xs ${cuponAplicado
                ? "text-green-700"
                : "text-red-600"
                }`}
            >
              {cuponMsg}
            </span>
          )}
        </div>

        {/* TOTAL FINAL */}
        <div className="mt-14 flex justify-end">
          <div className="flex flex-col items-end gap-1">
            {cuponAplicado && (
              <span className="text-sm text-gray-500 line-through">
                ${totalBase.toLocaleString("es-AR")}
              </span>
            )}

            <div className="rounded-full bg-[#6B5E54] px-8 py-3 text-white font-semibold">
              Total a pagar: ${totalPagar.toLocaleString("es-AR")}
            </div>

            {cuponAplicado && (
              <span className="text-xs text-green-700 font-medium">
                Ahorrás ${descuento.toLocaleString("es-AR")}
              </span>
            )}
          </div>
        </div>

        {/* BOTÓN MP */}
        <div className="mt-10 flex justify-center">
          <button
            onClick={handleConfirm}
            disabled={isProcessing}
            className="flex items-center gap-3 rounded-full bg-[#009EE3] px-7 py-3 text-white"
          >
            <img src="/mercadopago.svg" className="h-11" />
            {isProcessing ? "Redirigiendo..." : ""}
          </button>
        </div>

        {envioDemora && (
          <p className="mt-6 text-center text-xs text-[#7A6F66]">
            📦 {envioDemora}
          </p>
        )}

        {msg && (
          <p className="mt-4 text-center text-red-600">
            {msg}
          </p>
        )}
      </div>
    </div>
  );
}