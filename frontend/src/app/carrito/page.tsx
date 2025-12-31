"use client";

import Stepper from "@/components/stepper/Stepper";
import CartItemRow from "@/components/cart/CartItemRow";
import { useCart } from "@/lib/cartContext";
// ✅ IMPORTAMOS AUTH Y ROUTER
import { useAuth } from "@/lib/authContext";
import { useRouter } from "next/navigation";

export default function CarritoPage() {
  const { items, total } = useCart();
  // ✅ HOOKS PARA VERIFICAR LOGIN
  const { user } = useAuth();
  const router = useRouter();

  const handleContinuar = () => {
    if (user) {
      // Si está logueado, pasa al checkout
      router.push("/checkout");
    } else {
      // Si NO está logueado, lo mandamos a registrarse/login
      router.push("/login?redirect=/checkout");
    }
  };

  return (
    <div className="min-h-screen bg-[#FCFAF6]">
      <div className="max-w-[1100px] mx-auto px-6 py-16">

        {/* STEPPER */}
        <Stepper currentStep={1} />

        {/* TITULO */}
        <h2 className="mt-12 mb-6 text-sm font-semibold text-[#333]">
          Productos
        </h2>

        {/* LISTA */}
        <div className="space-y-6">
          {items.map((item) => (
            <CartItemRow
              key={`${item.productId}-${item.variantId}`}
              item={item}
            />
          ))}

          {items.length === 0 && (
            <p className="text-center text-gray-400 py-10">
              Tu carrito está vacío
            </p>
          )}
        </div>

      {/* FOOTER */}
      <div className="mt-16 space-y-10">
        {/* TOTAL */}
        <div className="flex justify-end">
          <div className="flex items-center gap-4 bg-[#C9C1B5] px-6 py-3 rounded-full">
            <span className="text-sm">Total</span>
            <span className="font-semibold">
              ${total.toLocaleString("es-AR")}
            </span>
          </div>
        </div>

        {/* BOTÓN CONTINUAR (Ahora con lógica) */}
        <div className="flex justify-center">
          <button
            onClick={handleContinuar}
            className="bg-[#6B7A63] text-white px-16 py-3 rounded-full font-medium hover:bg-[#5a6652] transition-colors"
          >
            Continuar
          </button>
        </div>
      </div>
      </div>
    </div>
  );
}