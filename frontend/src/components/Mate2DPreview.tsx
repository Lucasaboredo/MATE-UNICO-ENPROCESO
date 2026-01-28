"use client";

import Image from "next/image";

interface Props {
  texto: string;
  font?: string;
  imagenFondo?: string; // NUEVO: Para cambiar la foto del mate
  // Props de calibración (Valores "Golden" por defecto)
  posY?: number;
  curvatura?: number;
  ancho?: number;
  rotacion?: number;
  inclinacion?: number;
}

export default function Mate2DPreview({ 
  texto, 
  font = "'Times New Roman', serif",
  imagenFondo = "/camionero.png", // Imagen por defecto
  // --- TUS VALORES CALIBRADOS ---
  posY = 150,       
  curvatura = -164, 
  ancho = 301,      
  rotacion = -5,
  inclinacion = 28   
  // -----------------------------
}: Props) {

  // Cálculo del Path SVG
  const startX = (500 - ancho) / 2;
  const endX = startX + ancho;
  const controlY = posY + curvatura;
  
  // Curva cuadrática
  const dynamicPath = `M ${startX},${posY} Q 250,${controlY} ${endX},${posY}`;

  return (
    <div className="relative w-full max-w-[500px] aspect-[4/5] bg-white rounded-xl overflow-hidden shadow-2xl border border-gray-200 mx-auto">
      
      {/* 1. FOTO REAL DE FONDO (DINÁMICA) */}
      <Image
        src={imagenFondo}
        alt="Mate Real"
        fill
        className="object-cover transition-opacity duration-500"
        priority
      />

      {/* 2. TEXTO GRABADO CON PERSPECTIVA 3D */}
      <div 
        className="absolute top-0 left-0 w-full h-full pointer-events-none"
        style={{
          transform: `perspective(800px) rotateZ(${rotacion}deg) rotateX(${inclinacion}deg)`,
          transformOrigin: "center 35%",
        }}
      >
        <svg viewBox="0 0 500 500" className="w-full h-full overflow-visible">
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
                letterSpacing: "4px",
                mixBlendMode: "multiply",
                filter: "drop-shadow(0px 1px 0px rgba(255,255,255,0.4))",
              }}
            >
              {texto}
            </textPath>
          </text>
        </svg>
      </div>
    </div>
  );
}