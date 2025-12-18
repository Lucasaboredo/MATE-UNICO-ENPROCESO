// src/app/page.tsx
import Link from "next/link";
import { fetchFromStrapi } from "@/lib/api";
import HeroCarousel from "@/components/HeroCarousel";
import ProductCard from "@/components/ProductCard";

export default async function Home() {
  console.log("🚀 Cargando Home...");

  // 1. CARGA DEL HERO CAROUSEL
  let slides = [];
  try {
    const homeRes = await fetchFromStrapi("/api/homes?populate[imagen_hero]=true");
    slides = homeRes.data || [];
  } catch (error) {
    console.error("⚠️ Error cargando el Hero:", error);
  }

  // 2. CARGA DE PRODUCTOS DESTACADOS
  let productosDestacados = [];
  try {
    const prodRes = await fetchFromStrapi(
      "/api/productos?filters[destacado][$eq]=true&populate=imagen&populate=variantes"
    );
    productosDestacados = prodRes.data || [];
  } catch (error) {
    console.error("⚠️ Error cargando productos destacados:", error);
  }

  return (
    <div className="w-full flex flex-col items-center">

      {/* ================= HERO ================= */}
      {slides.length > 0 ? (
        <HeroCarousel slides={slides} />
      ) : (
        <div className="w-full h-[400px] bg-gray-200 flex flex-col items-center justify-center text-gray-500 gap-2">
          <p className="text-xl font-bold">Bienvenido a Mate Único</p>
          <p className="text-sm">(Carga imágenes en la colección 'Homes' de Strapi para ver el banner)</p>
        </div>
      )}

      {/* ================= PRODUCTOS DESTACADOS ================= */}
      <section className="w-full bg-white py-16">
        <div className="mx-auto max-w-[1200px] px-4 text-center">

          <h2 className="text-3xl font-bold text-[#2F4A2D] mb-10">
            Productos Destacados 🔥
          </h2>

          {productosDestacados.length > 0 ? (
            <div className="grid gap-10 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 justify-items-center">
              {productosDestacados.map((prod: any) => (
                <ProductCard key={prod.id} producto={prod} />
              ))}
            </div>
          ) : (
            <p className="text-gray-500 italic">No se encontraron productos destacados.</p>
          )}

          <div className="mt-10">
            <Link
              href="/productos"
              className="inline-flex items-center justify-center rounded-full border border-[#8D868D] px-8 py-2 text-sm font-medium text-[#333] hover:bg-[#5F6B58] transition"
            >
              Ver todos los productos
            </Link>
          </div>

        </div>
      </section>

    </div>
  );
}