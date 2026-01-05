"use client";

import { useState } from "react";
import Link from "next/link";
import Mate2DPreview from "@/components/Mate2DPreview";

export default function SimuladorPage() {
  const [texto, setTexto] = useState("TU NOMBRE");
  const [confirmado, setConfirmado] = useState(false);

  // Fuente fija "Clásica"
  const fontFija = "'Times New Roman', serif";

  const handleConfirmar = () => {
    if (!texto.trim()) return;
    setConfirmado(true);
    // Aquí podrías guardar el diseño en localStorage o Context si quisieras pasarlo al carrito
  };

  const handleReset = () => {
    setConfirmado(false);
    setTexto("TU NOMBRE");
  };

  return (
    <div className="min-h-screen bg-[#F9F7F2] pt-28 pb-20">
      <div className="container mx-auto px-4">
        
        <div className="text-center mb-10">
          <h1 className="text-4xl md:text-5xl font-bold text-[#1a1a1a] mb-4">
            Simulador de Grabado
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            {confirmado 
              ? "¡Así quedará tu mate! ¿Te gusta el resultado?"
              : "Probá cómo quedaría tu nombre en la virola."
            }
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start max-w-5xl mx-auto">
          
          {/* --- PANEL DE CONTROLES (Izquierda) --- */}
          <div className="lg:col-span-5 flex flex-col gap-6 bg-white p-8 rounded-3xl shadow-lg border border-gray-100 h-fit">
            
            {!confirmado ? (
              // MODO EDICIÓN
              <>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-3">
                    Escribí el nombre
                  </label>
                  <input
                    type="text"
                    value={texto}
                    onChange={(e) => setTexto(e.target.value.toUpperCase())}
                    maxLength={18}
                    className="w-full border border-gray-300 rounded-xl px-4 py-4 text-xl font-bold text-center tracking-widest focus:ring-2 focus:ring-[#4A4A40] outline-none uppercase placeholder-gray-300"
                    placeholder="EJ: JUAN"
                    autoFocus
                  />
                  <p className="text-xs text-gray-400 mt-2 text-right">
                    {texto.length}/14 letras
                  </p>
                </div>

                <div className="pt-4">
                   <p className="text-sm text-gray-500 mb-4 text-center">
                     Tipografía: <b>Clásica (Imperial)</b>
                   </p>
                   <button 
                     onClick={handleConfirmar}
                     disabled={texto.length < 1}
                     className="w-full bg-[#1a1a1a] text-white py-4 rounded-full font-bold uppercase tracking-wide hover:bg-[#333] transition transform hover:-translate-y-1 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                   >
                     Confirmar Diseño
                   </button>
                </div>
              </>
            ) : (
              // MODO CONFIRMADO (Resultado)
              <div className="text-center py-4">
                <div className="mb-6 flex justify-center">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center animate-bounce">
                    <span className="text-2xl">✨</span>
                  </div>
                </div>
                <h3 className="text-2xl font-bold text-[#1a1a1a] mb-2">
                  ¡Diseño Guardado!
                </h3>
                <p className="text-gray-500 mb-8 text-sm">
                  Tu grabado <b>"{texto}"</b> está listo.
                </p>

                <div className="space-y-3">
                  <Link 
                    href={`/productos?grabado=${texto}`} // Truco: Pasamos el texto por URL
                    className="block w-full bg-[#1a1a1a] text-white py-4 rounded-full font-bold uppercase tracking-wide hover:bg-[#333] shadow-lg"
                  >
                    Ir a Comprar este Mate
                  </Link>
                  
                  <button 
                    onClick={handleReset}
                    className="block w-full bg-white border-2 border-gray-200 text-gray-600 py-3 rounded-full font-bold uppercase tracking-wide hover:border-gray-400 hover:text-black transition"
                  >
                    Simular otro nombre
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* --- VISUALIZADOR (Derecha) --- */}
          <div className={`lg:col-span-7 transition-all duration-500 ${confirmado ? 'scale-105' : 'scale-100'}`}>
             {/* Cuando está confirmado, le quitamos opacidad o agregamos un marco dorado/verde 
                para indicar que es el "final".
             */}
             <div className={`relative transition-all duration-500 ${confirmado ? 'ring-4 ring-[#4A4A40] rounded-xl shadow-2xl' : ''}`}>
                <Mate2DPreview texto={texto} font={fontFija} />
                
                {confirmado && (
                  <div className="absolute top-4 right-4 bg-[#1a1a1a] text-white text-xs font-bold px-3 py-1 rounded-full shadow-md z-10">
                    DISEÑO FINAL
                  </div>
                )}
             </div>
          </div>

        </div>
      </div>
    </div>
  );
}