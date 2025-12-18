import Image from "next/image";
import Link from "next/link"; // <--- 1. Importamos Link

export function ProductoCard({ producto }: any) {
  const img = producto?.imagen?.[0];

  // Usamos el slug del producto, o "#" si no llegara a tener (para que no rompa)
  const href = producto.slug ? `/productos/${producto.slug}` : "#";

  return (
    // 2. Envolvemos todo en el Link
    <Link href={href} className="block h-full">
      <div className="
        h-full
        bg-[#5C5149]
        rounded-2xl
        p-4
        shadow-[0_8px_20px_rgba(0,0,0,0.25)]
        transition-all
        duration-200
        hover:-translate-y-1
        hover:shadow-[0_12px_28px_rgba(0,0,0,0.35)]
        cursor-pointer
      ">

        {/* Imagen */}
        {img && (
          <div className="relative w-full h-64 mb-4 overflow-hidden rounded-xl">
            <Image
              // Recomendación: Usa la variable de entorno si puedes, si no, deja el localhost
              src={`http://localhost:1337${img.url}`}
              alt={producto.nombre}
              fill
              className="object-cover"
            />
          </div>
        )}

        {/* Info */}
        <div className="px-1">
          <h2 className="text-[19px] font-semibold text-[#FCFAF6] leading-snug">
            {producto.nombre}
          </h2>

          <p className="mt-1 text-[20px] font-medium text-[#FCFAF6]">
            ${producto.precioBase?.toLocaleString("es-AR")}
          </p>
        </div>
      </div>
    </Link>
  );
}