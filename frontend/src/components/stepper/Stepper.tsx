"use client";

import Image from "next/image";

const steps = [
  { label: "Carrito", icon: "/stepper/cart.svg" },
  { label: "Datos", icon: "/stepper/file.svg" },
  { label: "Envío", icon: "/stepper/truck.svg" },
  { label: "Pago", icon: "/stepper/card.svg" },
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
            const active = index + 1 === currentStep;

            return (
              <div
                key={step.label}
                className="flex flex-col items-center gap-2 z-10"
              >
                <div
                  className={`
                    w-12 h-12 rounded-full flex items-center justify-center
                    bg-white
                    ${active ? "border-2 border-[#5C5149]" : "border border-transparent"}
                  `}
                >
                  <Image
                    src={step.icon}
                    alt={step.label}
                    width={22}
                    height={22}
                  />
                </div>

                <span className="text-sm font-medium text-black">
                  {step.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
