"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import type { CartItem } from "@/types/cart";

interface CartContextType {
  items: CartItem[];
  addToCart: (item: CartItem) => void;
  removeFromCart: (item: CartItem) => void; // Cambiado para recibir el objeto completo
  updateQuantity: (item: CartItem, cantidad: number) => void; // Cambiado
  clearCart: () => void;
  total: number;
  totalItems: number;
}

const CartContext = createContext<CartContextType | null>(null);

// Clave para guardar en el navegador
const STORAGE_KEY = "mate-unico-cart-v3"; // Actualizamos versión para limpiar bugs viejos

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

  /* -----------------------------------------------------------
     HELPER: Generar ID único para comparación
     Esto soluciona el bug: Diferencia items por grabado
  ----------------------------------------------------------- */
  const getSignature = (item: CartItem) => {
    return `${item.productId}-${item.variantId || 'null'}-${item.grabado ? 'con' : 'sin'}-${item.textoGrabado || ''}`;
  };

  /* ACCIONES */
  const addToCart = (newItem: CartItem) => {
    setItems((prev) => {
      const signatureNew = getSignature(newItem);
      
      const existingIndex = prev.findIndex(p => getSignature(p) === signatureNew);

      if (existingIndex >= 0) {
        // Si existe EXACTAMENTE igual, sumamos cantidad
        const updatedItems = [...prev];
        const existingItem = updatedItems[existingIndex];
        
        updatedItems[existingIndex] = {
          ...existingItem,
          cantidad: Math.min(existingItem.cantidad + newItem.cantidad, existingItem.stock),
        };
        return updatedItems;
      }

      // Si es diferente (ej: tiene grabado), se agrega como nuevo
      return [...prev, newItem];
    });
  };

  const updateQuantity = (targetItem: CartItem, cantidad: number) => {
    const signatureTarget = getSignature(targetItem);

    setItems((prev) =>
      prev.map((item) => {
        if (getSignature(item) === signatureTarget) {
          return {
            ...item,
            cantidad: Math.min(Math.max(cantidad, 1), item.stock),
          };
        }
        return item;
      })
    );
  };

  const removeFromCart = (targetItem: CartItem) => {
    const signatureTarget = getSignature(targetItem);
    setItems((prev) => prev.filter((p) => getSignature(p) !== signatureTarget));
  };

  const clearCart = () => setItems([]);

  /* DERIVADOS */
  const total = useMemo(
    () => items.reduce((acc, item) => acc + item.precioUnitario * item.cantidad, 0),
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