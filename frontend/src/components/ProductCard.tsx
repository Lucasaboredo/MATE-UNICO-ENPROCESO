// src/components/ProductCard.tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Producto } from "@/types/product";

const STRAPI_URL = "http://127.0.0.1:1337";

interface Props {
    producto: Producto;
}

export default function ProductCard({ producto }: Props) {
    // --- LÓGICA (Del nuevo card) ---
    const [currentImageIndex, setCurrentImageIndex] = useState(0);

    const getImageUrl = (url: string) => {
        if (!url) return "/placeholder-mate.jpg";
        return url.startsWith("http") ? url : `${STRAPI_URL}${url}`;
    };

    const currentImageUrl = producto.imagen && producto.imagen[currentImageIndex]
        ? getImageUrl(producto.imagen[currentImageIndex].url)
        : null;

    return (
        // --- ESTILOS (Del viejo card: Fondo Marrón, Sombras, Bordes) ---
        <div className="
        flex flex-col
        w-full max-w-[280px]
        bg-[#5C5149]
        rounded-2xl
        p-4
        shadow-[0_8px_20px_rgba(0,0,0,0.25)]
        transition-all
        duration-200
        hover:-translate-y-1
        hover:shadow-[0_12px_28px_rgba(0,0,0,0.35)]
        group
    ">

            {/* IMAGEN (Con Link) */}
            <Link href={`/productos/${producto.slug}`} className="relative w-full h-64 mb-4 overflow-hidden rounded-xl block bg-black/20">
                {currentImageUrl ? (
                    <Image
                        src={currentImageUrl}
                        alt={producto.nombre}
                        fill
                        className="object-cover transition-all duration-500 ease-in-out group-hover:scale-105"
                    />
                ) : (
                    <div className="flex items-center justify-center h-full text-white/50 text-xs">Sin Foto</div>
                )}
            </Link>

            {/* SWATCHES DE COLORES (Lógica nueva, adaptada al fondo oscuro) */}
            {producto.variantes && producto.variantes.some(v => v.codigo_color) && (
                <div className="flex gap-2 mb-3 justify-center">
                    {producto.variantes.map((variant) => (
                        variant.codigo_color && (
                            <button
                                key={variant.id}
                                onClick={(e) => {
                                    e.preventDefault(); // Evita navegación
                                    if (variant.indice_imagen !== undefined && variant.indice_imagen !== null && producto.imagen[variant.indice_imagen]) {
                                        setCurrentImageIndex(variant.indice_imagen);
                                    }
                                }}
                                // Agregamos border-white para que resalte en el fondo marrón
                                className="w-4 h-4 rounded-full border border-white/80 shadow-sm hover:scale-125 transition-transform cursor-pointer"
                                style={{ backgroundColor: variant.codigo_color }}
                                title={variant.nombre}
                            />
                        )
                    ))}
                </div>
            )}

            {/* INFO (Estilos del viejo card: Texto Claro) */}
            <div className="px-1 text-center sm:text-left">
                <h2 className="text-[19px] font-semibold text-[#FCFAF6] leading-snug">
                    <Link href={`/productos/${producto.slug}`} className="hover:underline decoration-white underline-offset-4">
                        {producto.nombre}
                    </Link>
                </h2>

                <p className="mt-1 text-[20px] font-medium text-[#FCFAF6]">
                    ${(producto.precioBase || 0).toLocaleString("es-AR")}
                </p>
            </div>

        </div>
    );
}