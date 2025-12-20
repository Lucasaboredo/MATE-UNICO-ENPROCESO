"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import Stepper from "@/components/stepper/Stepper";
import { useCart } from "@/lib/cartContext";
import { useCheckout } from "@/lib/checkoutContext";
import type { CartItem } from "@/types/cart";

export default function CheckoutDatosPage() {
  const router = useRouter();

  const { items, total } = useCart();
  const { buyer, setBuyer } = useCheckout();

  const [form, setForm] = useState({
    nombre: buyer.nombre,
    apellido: buyer.apellido,
    email: buyer.email,
    telefono: buyer.telefono,
  });

  const [error, setError] = useState<string | null>(null);

  // 🚫 Si el carrito está vacío, no debería estar acá
  if (!items || items.length === 0) {
    return (
      <div className="mx-auto max-w-5xl px-6 py-10">
        <Stepper currentStep={2} />
        <p className="mt-10 text-center text-[#333333]">Tu carrito está vacío.</p>
      </div>
    );
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  }

  function isValidEmail(email: string) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const { nombre, apellido, email, telefono } = form;

    if (!nombre.trim() || !apellido.trim() || !email.trim() || !telefono.trim()) {
      setError("Completá todos los campos.");
      return;
    }

    if (!isValidEmail(email)) {
      setError("El email no es válido.");
      return;
    }

    setBuyer(form);
    router.push("/checkout/envio");
  }

  return (
    <div className="mx-auto max-w-6xl px-6 py-10">
      <Stepper currentStep={2} />

      <div className="mt-10 grid gap-10 md:grid-cols-[1fr_420px]">
        {/* 🧍 Datos del comprador */}
        <form onSubmit={handleSubmit} className="rounded-2xl bg-[#FCFAF6] p-6 shadow-sm">
          <h1 className="text-xl font-semibold text-[#333333]">Datos del comprador</h1>

          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <div>
              <label className="text-sm text-[#5C5149]">Nombre</label>
              <input
                name="nombre"
                value={form.nombre}
                onChange={handleChange}
                className="mt-1 w-full rounded-xl border border-[#e7e2d9] bg-white px-4 py-3 text-[#333333] outline-none focus:border-[#5F6B58]"
              />
            </div>

            <div>
              <label className="text-sm text-[#5C5149]">Apellido</label>
              <input
                name="apellido"
                value={form.apellido}
                onChange={handleChange}
                className="mt-1 w-full rounded-xl border border-[#e7e2d9] bg-white px-4 py-3 text-[#333333] outline-none focus:border-[#5F6B58]"
              />
            </div>

            <div className="md:col-span-2">
              <label className="text-sm text-[#5C5149]">Email</label>
              <input
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                className="mt-1 w-full rounded-xl border border-[#e7e2d9] bg-white px-4 py-3 text-[#333333] outline-none focus:border-[#5F6B58]"
              />
            </div>

            <div className="md:col-span-2">
              <label className="text-sm text-[#5C5149]">Teléfono</label>
              <input
                name="telefono"
                value={form.telefono}
                onChange={handleChange}
                className="mt-1 w-full rounded-xl border border-[#e7e2d9] bg-white px-4 py-3 text-[#333333] outline-none focus:border-[#5F6B58]"
              />
            </div>
          </div>

          {error && <p className="mt-4 text-sm text-red-600">{error}</p>}

          <button
            type="submit"
            className="mt-6 w-full rounded-2xl bg-[#5F6B58] px-6 py-3 font-medium text-white hover:opacity-95"
          >
            Continuar
          </button>
        </form>

        {/* 🧾 Resumen del carrito (solo lectura) */}
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

          <div className="mt-6 flex justify-between border-t pt-4">
            <span className="text-sm text-[#5C5149]">Total</span>
            <span className="font-semibold text-[#333333]">
              ${Number(total).toLocaleString("es-AR")}
            </span>
          </div>
        </aside>
      </div>
    </div>
  );
}
