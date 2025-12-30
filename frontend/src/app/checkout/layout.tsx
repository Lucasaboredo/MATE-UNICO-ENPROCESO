"use client";

import { CheckoutProvider } from "@/lib/checkoutContext";

export default function CheckoutLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <CheckoutProvider>{children}</CheckoutProvider>;
}
