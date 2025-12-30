"use client";

import Image from "next/image";
import Link from "next/link";

const steps = [
  { label: "Carrito", icon: "/stepper/cart.svg", href: "/carrito" },
  { label: "Datos", icon: "/stepper/file.svg", href: "/checkout/datos" },
  { label: "Envío", icon: "/stepper/truck.svg", href: "/checkout/envio" },
  { label: "Pago", icon: "/stepper/card.svg", href: "/checkout/pago" },
];

export default function Stepper({ currentStep }: { currentStep: number }) {
  return (
    <div className="max-w-4xl mx-auto mt-10">
      <div className="relative bg-[#B6A999] rounded-2xl py-10 px-10">
        {/* Línea horizontal */}
        <div className="absolute left-[3.25rem] right-[3.25rem] top-[4.1rem] h-[2px] bg-black" />

        {/* Pasos */}
        <div className="relative flex justify-between">
          {steps.map((step, index) => {
            const stepNumber = index + 1;
            const active = stepNumber === currentStep;

            // ✅ Solo dejamos navegar a pasos ya alcanzados
            const clickable = stepNumber <= currentStep;

            const content = (
              <div
                className={[
                  "flex flex-col items-center gap-2 z-10",
                  clickable ? "cursor-pointer" : "cursor-not-allowed opacity-100",
                ].join(" ")}
              >
                <div
                  className={`
                    w-12 h-12 rounded-full flex items-center justify-center
                    bg-white
                    ${active ? "border-3 border-[#5C5149]" : "border border-transparent"}
                  `}
                >
                  <Image src={step.icon} alt={step.label} width={22} height={22} />
                </div>

                <span className="text-sm font-medium text-black">
                  {step.label}
                </span>
              </div>
            );

            // ✅ Si es clickeable, lo hacemos Link; si no, queda como div
            return clickable ? (
              <Link key={step.label} href={step.href} className="z-10">
                {content}
              </Link>
            ) : (
              <div key={step.label} className="z-10">
                {content}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
