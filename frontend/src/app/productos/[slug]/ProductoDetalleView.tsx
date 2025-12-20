// frontend/src/app/productos/[slug]/ProductoDetalleView.tsx
"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Producto, Variante } from "@/types/product";
import ProductCard from "@/components/ProductCard"; // Reutilizamos para los relacionados

// ✅ Carrito
import { useCart } from "@/lib/cartContext";
import type { CartItem } from "@/types/cart";

interface Props {
  producto: Producto;
  relacionados: Producto[];
}

export default function ProductoDetalleView({ producto, relacionados }: Props) {
  // ✅ carrito
  const { addToCart } = useCart();

  // --- 1. ESTADOS PRINCIPALES ---
  const [selectedImage, setSelectedImage] = useState<string>(
    producto.imagen && producto.imagen.length > 0 ? producto.imagen[0].url : ""
  );

  const [selectedVariant, setSelectedVariant] = useState<Variante | null>(
    producto.variantes && producto.variantes.length > 0 ? producto.variantes[0] : null
  );

  const [cantidad, setCantidad] = useState(1);
  const [showAllReviews, setShowAllReviews] = useState(false);

  // --- 2. ESTADOS PARA ENVÍO ---
  const [zipCode, setZipCode] = useState("");
  const [shippingCost, setShippingCost] = useState<number | null>(null);
  const [shippingDelay, setShippingDelay] = useState<string | null>(null);
  const [loadingShipping, setLoadingShipping] = useState(false);

  // Efecto: Cuando cambia la variante, cambiamos la foto principal
  useEffect(() => {
    setCantidad(1);

    // LOGICA NUEVA: Si la variante tiene indice_imagen, actualizamos la foto grande
    // (tu Variante tipada no tiene estos campos, por eso usamos "as any" para no romper TS)
    const indice = (selectedVariant as any)?.indice_imagen;
    if (selectedVariant && indice !== undefined && indice !== null) {
      if (producto.imagen && producto.imagen[indice]) {
        setSelectedImage(producto.imagen[indice].url);
      }
    }
  }, [selectedVariant, producto.imagen]);

  // --- 3. HELPERS ---
  const getImageUrl = (url: string) => {
    if (!url) return "/placeholder-mate.jpg";
    return url.startsWith("http") ? url : `http://localhost:1337${url}`;
  };

  const formatPrice = (amount: number) => {
    return amount.toLocaleString("es-AR", {
      style: "currency",
      currency: "ARS",
      maximumFractionDigits: 0,
    });
  };

  // --- 4. LÓGICA DE ENVÍO ---
  const handleCalculateShipping = async () => {
    if (!zipCode) return;
    setLoadingShipping(true);
    setShippingCost(null);
    setShippingDelay(null);

    try {
      const res = await fetch("/api/shipping", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cp: zipCode }),
      });
      const data = await res.json();
      if (data.price) {
        setShippingCost(data.price);
        setShippingDelay(data.delay);
      }
    } catch (error) {
      console.error("Error calculando envío", error);
    } finally {
      setLoadingShipping(false);
    }
  };

  // --- 5. LÓGICA DE STOCK (FIX: si stock viene undefined, NO deshabilitar el botón) ---
  const hasStockInfo = typeof selectedVariant?.stock === "number";
  const currentStock = hasStockInfo ? (selectedVariant?.stock as number) : 999999;
  const isOutOfStock = hasStockInfo ? currentStock === 0 : false;

  const handleRestar = () => setCantidad((prev) => (prev > 1 ? prev - 1 : 1));
  const handleSumar = () => {
    // si no hay stockInfo, dejamos sumar libre
    if (!hasStockInfo) return setCantidad((prev) => prev + 1);
    if (cantidad < currentStock) setCantidad((prev) => prev + 1);
  };

  // --- 6. AGREGAR AL CARRITO (NUEVO) ---
  const handleAddToCart = () => {
    const precio = selectedVariant?.precio ?? producto.precioBase;

    const item: CartItem = {
      productId: producto.id,
      variantId: selectedVariant?.id,
      nombre: selectedVariant
        ? `${producto.nombre} - ${selectedVariant.nombre}`
        : producto.nombre,
      slug: producto.slug,
      precioUnitario: precio,
      cantidad,
      imagenUrl: selectedImage,
      stock: selectedVariant?.stock ?? 999999, // 👈 CLAVE
    };

    console.log("🛒 AGREGANDO AL CARRITO:", item);
    addToCart(item);
  };

  return (
    <div className="min-h-screen bg-[#F9F7F2] text-[#1a1a1a] pb-20">
      {/* SECCIÓN SUPERIOR */}
      <div className="container mx-auto px-4 pt-10 lg:pt-16">
        <nav className="text-xs text-gray-500 mb-8 uppercase tracking-wide font-medium">
          <Link href="/">Home</Link> / <Link href="/productos">Productos</Link> /{" "}
          <span className="text-gray-900">{producto.nombre}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* GALERÍA */}
          <div className="lg:col-span-7 flex flex-col gap-4">
            <div className="relative w-full aspect-square bg-white rounded-xl overflow-hidden shadow-sm">
              {selectedImage ? (
                <Image
                  src={getImageUrl(selectedImage)}
                  alt={producto.nombre}
                  fill
                  className="object-cover"
                  priority
                />
              ) : (
                <div className="flex items-center justify-center h-full text-gray-400">
                  Sin imagen
                </div>
              )}
            </div>

            {producto.imagen && producto.imagen.length > 1 && (
              <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
                {producto.imagen.map((img) => (
                  <button
                    key={img.id}
                    onClick={() => setSelectedImage(img.url)}
                    className={`relative w-24 h-24 flex-shrink-0 rounded-lg overflow-hidden border-2 transition-all ${
                      selectedImage === img.url
                        ? "border-[#4A4A40]"
                        : "border-transparent hover:border-gray-300"
                    }`}
                  >
                    <Image
                      src={getImageUrl(img.url)}
                      alt="Thumbnail"
                      fill
                      className="object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* INFORMACIÓN */}
          <div className="lg:col-span-5 flex flex-col pt-2">
            <h1 className="text-4xl md:text-[78px] font-bold text-[#1a1a1a] mb-2 leading-[1.1] tracking-tight">
              {producto.nombre}
            </h1>

            <p className="text-3xl font-medium text-[#1a1a1a] mb-6">
              {formatPrice(selectedVariant?.precio || producto.precioBase)}
            </p>

            <div className="text-gray-600 text-sm leading-relaxed mb-6 space-y-4 font-normal">
              <p>{producto.descripcion}</p>
            </div>

            <div className="mb-6">
              <span className="font-bold text-sm mr-1">¡Nuevo!</span>
              <Link
                href="/simulador"
                className="text-sm font-medium underline underline-offset-4 hover:text-[#4A4A40]"
              >
                Grabado de virola
              </Link>
            </div>

            {/* VARIANTES CON COLOR */}
            {producto.variantes && producto.variantes.length > 0 && (
              <div className="mb-8">
                <p className="text-sm font-bold text-gray-900 mb-3 uppercase tracking-wider">
                  Elige una opción:
                </p>
                <div className="flex flex-wrap gap-3">
                  {producto.variantes.map((variant) => {
                    const codigoColor = (variant as any).codigo_color as string | undefined;

                    return (
                      <button
                        key={variant.id}
                        onClick={() => setSelectedVariant(variant)}
                        className={`px-4 py-2 rounded-full text-sm font-medium border transition-all flex items-center gap-2 ${
                          selectedVariant?.id === variant.id
                            ? "bg-[#4A4A40] text-white border-[#4A4A40]"
                            : "bg-white text-gray-600 border-gray-300 hover:border-[#4A4A40]"
                        } ${variant.stock === 0 ? "opacity-50 cursor-not-allowed" : ""}`}
                        disabled={variant.stock === 0}
                      >
                        {/* Círculo de color (Si existe) */}
                        {codigoColor && (
                          <span
                            className={`w-3 h-3 rounded-full border border-gray-300 shadow-sm ${
                              selectedVariant?.id === variant.id ? "border-white" : ""
                            }`}
                            style={{ backgroundColor: codigoColor }}
                          />
                        )}
                        {variant.nombre}
                      </button>
                    );
                  })}
                </div>

                {/* Solo mostramos stock si realmente vino como número */}
                {selectedVariant && hasStockInfo && !isOutOfStock && (
                  <p className="text-xs text-gray-500 mt-2">
                    Stock disponible: {selectedVariant.stock} u.
                  </p>
                )}
              </div>
            )}

            {/* BOTONES */}
            <div className="flex items-center gap-4 mb-8">
              <div
                className={`flex items-center border border-gray-300 rounded-full px-4 py-3 bg-white shadow-sm ${
                  isOutOfStock ? "opacity-50 pointer-events-none" : ""
                }`}
              >
                <button
                  onClick={handleRestar}
                  className="text-gray-500 hover:text-black px-2 text-lg"
                >
                  -
                </button>
                <span className="w-8 text-center text-sm font-semibold">
                  {cantidad}
                </span>
                <button
                  onClick={handleSumar}
                  className={`text-gray-500 px-2 text-lg ${
                    hasStockInfo && cantidad >= currentStock
                      ? "opacity-30 cursor-not-allowed"
                      : "hover:text-black"
                  }`}
                  disabled={hasStockInfo && cantidad >= currentStock}
                >
                  +
                </button>
              </div>

              <button
                onClick={handleAddToCart}  // ✅ AHORA SÍ FUNCIONA
                disabled={isOutOfStock}
                className={`flex-1 text-white text-sm font-semibold uppercase tracking-wide py-4 px-6 rounded-full transition shadow-md hover:shadow-lg transform 
                  ${
                    isOutOfStock
                      ? "bg-gray-400 cursor-not-allowed hover:transform-none shadow-none"
                      : "bg-[#4A4A40] hover:bg-[#3E3E35] hover:-translate-y-0.5"
                  }`}
              >
                {isOutOfStock ? "Sin Stock" : "Añadir al carrito"}
              </button>
            </div>

            {/* ENVÍO */}
            <div className="pt-2 border-t border-gray-200 mt-2">
              <p className="text-sm font-medium mb-2 mt-4">
                Calcular costo de envío
              </p>
              <div className="flex gap-2 relative max-w-md items-center">
                <input
                  type="text"
                  placeholder="Código postal"
                  value={zipCode}
                  onChange={(e) => setZipCode(e.target.value)}
                  className="w-full border border-gray-300 rounded-full pl-5 pr-32 py-3 text-sm focus:outline-none focus:border-[#4A4A40] bg-white"
                />
                <button
                  onClick={handleCalculateShipping}
                  disabled={loadingShipping}
                  className="absolute right-1 top-1 bottom-1 bg-[#A89F91] text-white px-6 rounded-full text-xs font-bold hover:bg-[#968e80] transition uppercase tracking-wide disabled:opacity-70"
                >
                  {loadingShipping ? "..." : "CALCULAR"}
                </button>
              </div>

              {shippingCost !== null && (
                <div className="mt-4 p-4 bg-white rounded-lg border border-gray-200 flex items-start gap-3 shadow-sm animate-in fade-in slide-in-from-top-2">
                  <div className="text-[#4A4A40] text-xl">🚚</div>
                  <div>
                    <p className="text-sm font-bold text-gray-900">
                      Envío a domicilio: {formatPrice(shippingCost)}
                    </p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {shippingDelay}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* OPINIONES */}
      <div className="container mx-auto px-4 mt-24 max-w-6xl border-t border-gray-200 pt-16">
        <h2 className="text-2xl font-semibold mb-2">Opiniones del producto</h2>

        {producto.opinions && producto.opinions.length > 0 ? (
          <>
            <div className="flex items-center gap-3 mb-8">
              <span className="text-5xl font-medium text-[#1a1a1a]">
                {(
                  producto.opinions.reduce(
                    (acc: number, op: any) => acc + (op.Puntuacion || 0),
                    0
                  ) / producto.opinions.length
                ).toFixed(1)}
              </span>
              <div className="flex flex-col">
                <div className="flex text-[#4A4A40] text-lg">★★★★☆</div>
                <span className="text-xs text-gray-500">
                  {producto.opinions.length} calificaciones
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-16 gap-y-10 mb-8 mt-8">
              {producto.opinions
                .slice(0, showAllReviews ? producto.opinions.length : 2)
                .map((review: any) => (
                  <div key={review.id} className="border-b border-gray-100 pb-4">
                    <div className="flex text-[#4A4A40] text-sm mb-1">
                      {"★".repeat(review.Puntuacion || 5)}
                      {"☆".repeat(5 - (review.Puntuacion || 5))}
                    </div>
                    <p className="text-gray-900 font-medium mb-1 text-sm italic">
                      "{review.Texto}"
                    </p>
                    <p className="text-[10px] text-gray-400 uppercase tracking-wider">
                      {review.Autor}{" "}
                      {review.createdAt &&
                        ` - ${new Date(review.createdAt).toLocaleDateString()}`}
                    </p>
                  </div>
                ))}
            </div>

            {producto.opinions.length > 2 && (
              <button
                onClick={() => setShowAllReviews(!showAllReviews)}
                className="text-[#4A4A40] text-sm font-bold hover:underline"
              >
                {showAllReviews ? "Mostrar menos opiniones" : "Mostrar todas las opiniones"}
              </button>
            )}
          </>
        ) : (
          <p className="text-gray-500 italic mt-4">
            Este producto aún no tiene opiniones. ¡Sé el primero en comentar!
          </p>
        )}
      </div>

      {/* RELACIONADOS (Usamos ProductCard) */}
      <div className="container mx-auto px-4 mt-24 max-w-6xl pb-12">
        <h3 className="text-center text-xl font-bold mb-10 text-[#1a1a1a]">
          También te podría interesar...
        </h3>
        {relacionados.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 justify-items-center">
            {relacionados.map((item) => (
              <ProductCard key={item.id} producto={item} />
            ))}
          </div>
        ) : (
          <p className="text-center text-gray-400">
            No hay productos destacados por el momento.
          </p>
        )}
      </div>
    </div>
  );
}
