"use client";

import Image from "next/image";
import Link from "next/link";
import { useCart } from "@/lib/cartContext";

export default function CartItemRow({ item }: any) {
  const { updateQuantity, removeFromCart } = useCart();

  const imgUrl = item.imagenUrl?.startsWith("http")
    ? item.imagenUrl
    : `http://localhost:1337${item.imagenUrl}`;

  const handleDecrease = () => {
    if (item.cantidad > 1) {
      updateQuantity(item.productId, item.variantId, item.cantidad - 1);
    }
  };

  const handleIncrease = () => {
    updateQuantity(item.productId, item.variantId, item.cantidad + 1);
  };

  const handleRemove = () => {
    removeFromCart(item.productId, item.variantId);
  };

  return (
    <div className="bg-[#5C5149] rounded-2xl px-6 py-4 flex items-center justify-between gap-6">
      
      {/* 👉 CLICKABLE: imagen + nombre */}
      <Link
        href={`/productos/${item.slug}`}
        className="flex items-center gap-4 flex-1 cursor-pointer"
      >
        {/* Imagen */}
        <div className="relative w-[70px] h-[70px] rounded-xl overflow-hidden bg-white">
          <Image
            src={imgUrl}
            alt={item.nombre}
            fill
            className="object-cover"
          />
        </div>

        {/* Texto */}
        <div>
          <p className="text-[#FCFAF6] font-semibold leading-tight">
            {item.nombre}
          </p>

          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              handleRemove();
            }}
            className="text-red-400 text-sm mt-1 hover:underline"
          >
            Eliminar
          </button>
        </div>
      </Link>

      {/* 👉 CONTROLES DE CANTIDAD */}
      <div
        className="flex items-center bg-white rounded-full px-3 py-1 shadow-sm"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={handleDecrease}
          className="px-2 text-black font-bold"
        >
          –
        </button>

        <span className="w-6 text-center text-black font-semibold">
          {item.cantidad}
        </span>

        <button
          onClick={handleIncrease}
          className="px-2 text-black font-bold"
        >
          +
        </button>
      </div>

      {/* Precio */}
      <div className="text-[#FCFAF6] font-semibold min-w-[90px] text-right">
        ${(item.precioUnitario * item.cantidad).toLocaleString("es-AR")}
      </div>
    </div>
  );
}
