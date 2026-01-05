"use client";

import Image from "next/image";

interface Props {
  texto: string;
  font?: string; // Opcional, usaremos una por defecto si no viene
}

export default function Mate2DPreview({ texto, font = "'Times New Roman', serif" }: Props) {
  // --- VALORES CALIBRADOS (Fijos) ---
  const posY = 145;       // Altura
  const curvatura = -121; // Curva negativa (arco hacia arriba)
  const ancho = 245;      // Apertura
  const rotacion = 3;     // Rotación leve

  // Cálculo del Path SVG
  const startX = (500 - ancho) / 2;
  const endX = startX + ancho;
  const controlY = posY + curvatura;
  const dynamicPath = `M ${startX},${posY} Q 250,${controlY} ${endX},${posY}`;

  return (
    <div className="relative w-full max-w-[500px] aspect-[4/5] bg-white rounded-xl overflow-hidden shadow-2xl border border-gray-200 mx-auto">
      
      {/* 1. FOTO REAL DE FONDO */}
      <Image
        src="/mate-frontal.webp"
        alt="Mate Real"
        fill
        className="object-cover"
        priority
      />

      {/* 2. TEXTO GRABADO */}
      <svg 
        viewBox="0 0 500 500" 
        className="absolute top-0 left-0 w-full h-full pointer-events-none"
        style={{ transform: `rotate(${rotacion}deg)` }}
      >
        <defs>
          <path id="curvePath" d={dynamicPath} fill="transparent" />
        </defs>

        <text width="500">
          <textPath
            href="#curvePath"
            startOffset="50%"
            textAnchor="middle"
            className="fill-[#1a1a1a]"
            style={{
              fontSize: "24px",
              fontFamily: font,
              fontWeight: "bold",
              letterSpacing: "4px", // Un poco más espaciado para que se lea mejor en curva
              mixBlendMode: "multiply",
              filter: "drop-shadow(0px 1px 0px rgba(255,255,255,0.4))",
            }}
          >
            {texto}
          </textPath>
        </text>
      </svg>
    </div>
  );
}