"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import type { CartItem } from "@/types/cart";

interface CartContextType {
  items: CartItem[];
  addToCart: (item: CartItem) => void;
  removeFromCart: (productId: number, variantId?: number) => void;
  updateQuantity: (
    productId: number,
    variantId: number | undefined,
    cantidad: number
  ) => void;
  clearCart: () => void;
  total: number;
  totalItems: number;
}

const CartContext = createContext<CartContextType | null>(null);
const STORAGE_KEY = "mate-unico-cart";

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);

  /* CARGA INICIAL */
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) setItems(JSON.parse(stored));
  }, []);

  /* PERSISTENCIA */
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items]);

  /* ACCIONES */
  const addToCart = (item: CartItem) => {
    setItems((prev) => {
      const existing = prev.find(
        (p) =>
          p.productId === item.productId &&
          p.variantId === item.variantId
      );

      if (existing) {
        return prev.map((p) =>
          p.productId === item.productId &&
          p.variantId === item.variantId
            ? {
                ...p,
                cantidad: Math.min(
                  p.cantidad + item.cantidad,
                  p.stock
                ),
              }
            : p
        );
      }

      return [
        ...prev,
        { ...item, cantidad: Math.min(item.cantidad, item.stock) },
      ];
    });
  };

  const updateQuantity = (
    productId: number,
    variantId: number | undefined,
    cantidad: number
  ) => {
    setItems((prev) =>
      prev
        .map((item) =>
          item.productId === productId &&
          item.variantId === variantId
            ? {
                ...item,
                cantidad: Math.min(
                  Math.max(cantidad, 0),
                  item.stock
                ),
              }
            : item
        )
        .filter((item) => item.cantidad > 0)
    );
  };

  const removeFromCart = (productId: number, variantId?: number) => {
    setItems((prev) =>
      prev.filter(
        (p) =>
          !(
            p.productId === productId &&
            p.variantId === variantId
          )
      )
    );
  };

  const clearCart = () => setItems([]);

  /* DERIVADOS */
  const total = useMemo(
    () =>
      items.reduce(
        (acc, item) => acc + item.precioUnitario * item.cantidad,
        0
      ),
    [items]
  );

  const totalItems = useMemo(
    () => items.reduce((acc, item) => acc + item.cantidad, 0),
    [items]
  );

  return (
    <CartContext.Provider
      value={{
        items,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        total,
        totalItems,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) {
    throw new Error("useCart must be used inside CartProvider");
  }
  return ctx;
}
