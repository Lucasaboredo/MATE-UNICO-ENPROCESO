"use client";

import { createContext, useContext, useState } from "react";

type BuyerData = {
  nombre: string;
  apellido: string;
  email: string;
  telefono: string;
};

type ShippingData = {
  calle: string;
  numero: string;
  ciudad: string;
  provincia: string;
  codigoPostal: string;
  metodoEnvio: "standard" | "express";
  costoEnvio: number;
};

type CheckoutContextType = {
  buyer: BuyerData;
  shipping: ShippingData;
  setBuyer: (data: BuyerData) => void;
  setShipping: (data: ShippingData) => void;
};

const CheckoutContext = createContext<CheckoutContextType | null>(null);

const initialBuyer: BuyerData = {
  nombre: "",
  apellido: "",
  email: "",
  telefono: "",
};

const initialShipping: ShippingData = {
  calle: "",
  numero: "",
  ciudad: "",
  provincia: "",
  codigoPostal: "",
  metodoEnvio: "standard",
  costoEnvio: 0,
};

export function CheckoutProvider({ children }: { children: React.ReactNode }) {
  const [buyer, setBuyer] = useState<BuyerData>(initialBuyer);
  const [shipping, setShipping] = useState<ShippingData>(initialShipping);

  return (
    <CheckoutContext.Provider value={{ buyer, shipping, setBuyer, setShipping }}>
      {children}
    </CheckoutContext.Provider>
  );
}

export function useCheckout() {
  const context = useContext(CheckoutContext);
  if (!context) {
    throw new Error("useCheckout debe usarse dentro de CheckoutProvider");
  }
  return context;
}
