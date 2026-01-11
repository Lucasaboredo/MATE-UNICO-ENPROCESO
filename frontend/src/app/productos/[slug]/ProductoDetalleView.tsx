"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Producto, Variante } from "@/types/product";
import ProductCard from "@/components/ProductCard";

// ✅ Carrito
import { useCart } from "@/lib/cartContext";
import type { CartItem } from "@/types/cart";

// ✅ Autenticación
import { useAuth } from "@/lib/authContext";

interface Props {
  producto: Producto;
  relacionados: Producto[];
}

// 💰 CONFIGURACIÓN DEL GRABADO
const COSTO_GRABADO = 5000;
const CARACTERES_MAXIMOS = 14;

export default function ProductoDetalleView({ producto, relacionados }: Props) {
  // ✅ Carrito
  const { addToCart } = useCart();
  
  // ✅ Auth (Para validar si puede reseñar)
  const { user, token } = useAuth();

  // --- 1. ESTADOS PRINCIPALES ---
  const [selectedImage, setSelectedImage] = useState<string>(
    producto.imagen && producto.imagen.length > 0 ? producto.imagen[0].url : ""
  );

  const [selectedVariant, setSelectedVariant] = useState<Variante | null>(
    producto.variantes && producto.variantes.length > 0 ? producto.variantes[0] : null
  );

  const [cantidad, setCantidad] = useState(1);
  const [showAllReviews, setShowAllReviews] = useState(false);
  const [added, setAdded] = useState(false);

  // ✨ GRABADO
  const [conGrabado, setConGrabado] = useState(false);
  const [textoGrabado, setTextoGrabado] = useState("");
  // 🔴 Estado para el error de validación
  const [grabadoError, setGrabadoError] = useState("");

  // --- 2. ESTADOS PARA ENVÍO ---
  const [zipCode, setZipCode] = useState("");
  const [shippingCost, setShippingCost] = useState<number | null>(null);
  const [shippingDelay, setShippingDelay] = useState<string | null>(null);
  const [loadingShipping, setLoadingShipping] = useState(false);

  // --- 3. ESTADOS PARA RESEÑAS ---
  const [rating, setRating] = useState(5);
  const [comentario, setComentario] = useState("");
  const [reviewStatus, setReviewStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  // Efecto: Cuando cambia la variante, cambiamos la foto principal
  useEffect(() => {
    setCantidad(1);
    const indice = (selectedVariant as any)?.indice_imagen;
    if (selectedVariant && indice !== undefined && indice !== null) {
      if (producto.imagen && producto.imagen[indice]) {
        setSelectedImage(producto.imagen[indice].url);
      }
    }
  }, [selectedVariant, producto.imagen]);

  // --- 4. HELPERS ---
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

  // 🛠️ LÓGICA CLAVE: ¿Este producto admite grabado? (Desde Strapi)
  const admiteGrabado = producto.permite_grabado === true;

  // --- 5. LÓGICA DE ENVÍO ---
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

  // --- 6. LÓGICA DE STOCK ---
  const hasStockInfo = typeof selectedVariant?.stock === "number";
  const currentStock = hasStockInfo ? (selectedVariant?.stock as number) : 999999;
  const isOutOfStock = hasStockInfo ? currentStock === 0 : false;

  const handleRestar = () => setCantidad((prev) => (prev > 1 ? prev - 1 : 1));
  const handleSumar = () => {
    if (!hasStockInfo) return setCantidad((prev) => prev + 1);
    if (cantidad < currentStock) setCantidad((prev) => prev + 1);
  };

  // --- 7. AGREGAR AL CARRITO ---
  const handleAddToCart = () => {
    try {
      let precioFinal = selectedVariant?.precio ?? producto.precioBase;
      let nombreParaCarrito = selectedVariant
        ? `${producto.nombre} - ${selectedVariant.nombre}`
        : producto.nombre;

      // ✨ Lógica de Grabado
      if (conGrabado) {
        // 🔴 VALIDACIÓN VISUAL
        if (!textoGrabado.trim()) {
          setGrabadoError("⚠️ Por favor, escribe el texto para el grabado");
          return; // Detenemos la función aquí
        }
        
        // Sumamos costo y modificamos el nombre visual
        precioFinal += COSTO_GRABADO;
        nombreParaCarrito += ` (Grabado: "${textoGrabado}")`;
      }

      const item: CartItem = {
        productId: producto.id,
        variantId: selectedVariant?.id,
        nombre: nombreParaCarrito,
        slug: producto.slug,
        precioUnitario: precioFinal,
        cantidad,
        imagenUrl: selectedImage,
        stock: selectedVariant?.stock ?? 999999,
        // Metadata extra
        grabado: conGrabado,
        textoGrabado: conGrabado ? textoGrabado : undefined,
      };

      addToCart(item);
      setAdded(true);

      // Limpiamos selección y errores
      setConGrabado(false);
      setTextoGrabado("");
      setGrabadoError("");

      window.setTimeout(() => setAdded(false), 1000);
    } catch (e) {
      console.error("❌ Error al agregar al carrito:", e);
    }
  };

  // --- 8. ENVIAR RESEÑA ---
  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !token) return;

    setReviewStatus("submitting");
    setErrorMsg("");

    try {
      const API_URL = process.env.NEXT_PUBLIC_STRAPI_URL || "http://127.0.0.1:1337";
      
      const res = await fetch(`${API_URL}/api/opinions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          data: {
            Puntuacion: rating,
            Texto: comentario,
            producto: producto.id
          }
        })
      });

      if (!res.ok) {
        const errorData = await res.json();
        if (res.status === 403) {
          throw new Error("Solo puedes opinar sobre productos que has comprado.");
        }
        throw new Error(errorData?.error?.message || "Error al enviar la reseña.");
      }

      setReviewStatus("success");
      setComentario("");
      setRating(5);
    } catch (err: any) {
      console.error("Error submit review:", err);
      setReviewStatus("error");
      setErrorMsg(err.message);
    }
  };

  return (
    <div className="min-h-screen bg-[#F9F7F2] text-[#1a1a1a] pb-20">
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

            {/* PRECIO DINÁMICO */}
            <p className="text-3xl font-medium text-[#1a1a1a] mb-6 animate-in fade-in duration-300">
              {formatPrice(
                (selectedVariant?.precio || producto.precioBase) + (conGrabado ? COSTO_GRABADO : 0)
              )}
            </p>

            <div className="text-gray-600 text-sm leading-relaxed mb-6 space-y-4 font-normal">
              <p>{producto.descripcion}</p>
            </div>

            {/* VARIANTES */}
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

                {selectedVariant && hasStockInfo && !isOutOfStock && (
                  <p className="text-xs text-gray-500 mt-2">
                    Stock disponible: {selectedVariant.stock} u.
                  </p>
                )}
              </div>
            )}

            {/* ✨ SECCIÓN DE GRABADO CON ERROR VISUAL ✨ */}
            {admiteGrabado && !isOutOfStock && (
              <div className={`mb-8 p-5 bg-[#F4F1EA] border rounded-xl shadow-sm transition-colors ${grabadoError ? 'border-red-400 bg-red-50' : 'border-[#E5E0D8]'}`}>
                <div className="flex items-center justify-between mb-3">
                  <label className="flex items-center gap-3 cursor-pointer select-none">
                    <div className={`w-6 h-6 rounded flex items-center justify-center border transition-colors ${conGrabado ? 'bg-[#4A4A40] border-[#4A4A40]' : 'bg-white border-gray-300'}`}>
                      {conGrabado && <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
                    </div>
                    <input 
                      type="checkbox" 
                      className="hidden"
                      checked={conGrabado}
                      onChange={(e) => {
                        setConGrabado(e.target.checked);
                        if (!e.target.checked) setGrabadoError(""); // Limpiar error si desmarca
                      }}
                    />
                    <span className="font-bold text-[#4A4A40] text-base">
                      Quiero grabado personalizado
                    </span>
                  </label>
                  <span className="text-sm font-semibold text-[#4A4A40] bg-white px-2 py-1 rounded border border-[#E5E0D8]">
                    +{formatPrice(COSTO_GRABADO)}
                  </span>
                </div>

                {conGrabado && (
                  <div className="ml-0 animate-in fade-in slide-in-from-top-2 duration-300">
                    <p className="text-xs text-gray-500 mb-2">Escribe un nombre, iniciales o una fecha especial:</p>
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="Ej: Lucas"
                        maxLength={CARACTERES_MAXIMOS}
                        value={textoGrabado}
                        onChange={(e) => {
                          setTextoGrabado(e.target.value);
                          if (e.target.value.trim()) setGrabadoError(""); // 🟢 Borrar error al escribir
                        }}
                        className={`w-full p-3 pr-16 border rounded-lg focus:outline-none focus:ring-1 transition-all text-sm shadow-inner bg-white 
                          ${grabadoError 
                            ? "border-red-500 focus:border-red-500 focus:ring-red-200" 
                            : "border-gray-300 focus:border-[#4A4A40] focus:ring-[#4A4A40]"
                          }`}
                        autoFocus
                      />
                      <span className={`absolute right-3 top-3.5 text-xs font-mono ${textoGrabado.length === CARACTERES_MAXIMOS ? 'text-red-500 font-bold' : 'text-gray-400'}`}>
                        {textoGrabado.length}/{CARACTERES_MAXIMOS}
                      </span>
                    </div>

                    {/* 🔴 MENSAJE DE ERROR ROJO */}
                    {grabadoError && (
                      <p className="text-red-600 text-xs font-bold mt-2 animate-pulse">
                        {grabadoError}
                      </p>
                    )}
                    
                    {/* BOTÓN SIMULADOR */}
                    <Link 
                      href="/simulador"
                      className="mt-4 block w-full py-3 bg-transparent border border-[#4A4A40] rounded-lg text-[#4A4A40] text-xs font-bold uppercase tracking-widest text-center transition-all hover:bg-[#4A4A40] hover:text-white shadow-sm"
                    >
                      ¿Dudas? Probá tu diseño en nuestro Simulador
                    </Link>
                  </div>
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
                onClick={handleAddToCart}
                disabled={isOutOfStock}
                className={`flex-1 text-white text-sm font-semibold uppercase tracking-wide py-4 px-6 rounded-full transition-all duration-300 shadow-md hover:shadow-lg transform
                  ${
                    isOutOfStock
                      ? "bg-gray-400 cursor-not-allowed hover:transform-none shadow-none"
                      : added
                      ? "bg-green-600 scale-[1.03] ring-2 ring-green-300"
                      : "bg-[#4A4A40] hover:bg-[#3E3E35] hover:-translate-y-0.5"
                  }`}
              >
                {isOutOfStock ? "Sin Stock" : added ? "✓ Añadido" : "Añadir al carrito"}
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

      {/* SECCIÓN DE OPINIONES Y RESEÑAS */}
      <div className="container mx-auto px-4 mt-24 max-w-6xl border-t border-gray-200 pt-16">
        <h2 className="text-2xl font-semibold mb-8">Opiniones del producto</h2>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-12">
          {/* COLUMNA IZQUIERDA: RESUMEN Y LISTADO */}
          <div className="md:col-span-7">
            {producto.opinions && producto.opinions.length > 0 ? (
              <>
                <div className="flex items-center gap-4 mb-8 bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                  <span className="text-5xl font-bold text-[#1a1a1a]">
                    {(
                      producto.opinions.reduce(
                        (acc: number, op: any) => acc + (op.Puntuacion || 0),
                        0
                      ) / producto.opinions.length
                    ).toFixed(1)}
                  </span>
                  <div className="flex flex-col">
                    <div className="flex text-[#4A4A40] text-lg">★★★★☆</div>
                    <span className="text-sm text-gray-500">
                      Basado en {producto.opinions.length} reseñas
                    </span>
                  </div>
                </div>

                <div className="flex flex-col gap-6">
                  {producto.opinions
                    .slice(0, showAllReviews ? producto.opinions.length : 3)
                    .map((review: any) => (
                      <div key={review.id} className="border-b border-gray-100 pb-6 last:border-0">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex text-[#4A4A40] text-sm">
                            {"★".repeat(review.Puntuacion || 5)}
                            {"☆".repeat(5 - (review.Puntuacion || 5))}
                          </div>
                          <span className="text-xs text-gray-400">
                            {review.createdAt && new Date(review.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-gray-700 text-sm leading-relaxed mb-2">
                          "{review.Texto}"
                        </p>
                        <p className="text-xs font-bold text-gray-900 uppercase tracking-wider">
                          - {review.Autor || "Anónimo"}
                        </p>
                      </div>
                    ))}
                </div>

                {producto.opinions.length > 3 && (
                  <button
                    onClick={() => setShowAllReviews(!showAllReviews)}
                    className="mt-6 text-[#4A4A40] text-sm font-bold hover:underline"
                  >
                    {showAllReviews ? "Mostrar menos" : `Ver todas (${producto.opinions.length})`}
                  </button>
                )}
              </>
            ) : (
              <div className="text-center py-10 bg-gray-50 rounded-xl border border-dashed border-gray-300">
                <p className="text-gray-500 italic">
                  Este producto aún no tiene opiniones.
                </p>
              </div>
            )}
          </div>

          {/* COLUMNA DERECHA: FORMULARIO DE RESEÑA */}
          <div className="md:col-span-5">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 sticky top-24">
              <h3 className="text-lg font-bold mb-4 text-[#1a1a1a]">¡Cuéntanos tu experiencia!</h3>
              
              {!user ? (
                <div className="text-center py-6">
                  <p className="text-gray-500 text-sm mb-4">
                    Debes iniciar sesión y haber comprado este producto para dejar una reseña.
                  </p>
                  <Link 
                    href="/login" 
                    className="inline-block bg-[#1a1a1a] text-white px-6 py-2 rounded-full text-sm font-bold hover:bg-[#333] transition"
                  >
                    Iniciar Sesión
                  </Link>
                </div>
              ) : reviewStatus === "success" ? (
                <div className="bg-green-50 p-4 rounded-lg text-green-800 border border-green-200 text-sm animate-in fade-in">
                  <p className="font-bold mb-1">¡Gracias por tu opinión!</p>
                  Tu reseña ha sido enviada y está pendiente de moderación.
                </div>
              ) : (
                <form onSubmit={handleSubmitReview}>
                  <div className="mb-4">
                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">
                      Calificación
                    </label>
                    <div className="flex gap-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          type="button"
                          key={star}
                          onClick={() => setRating(star)}
                          className={`text-2xl transition-colors ${
                            star <= rating ? "text-[#4A4A40]" : "text-gray-200 hover:text-gray-300"
                          }`}
                        >
                          ★
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="mb-4">
                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">
                      Tu comentario
                    </label>
                    <textarea
                      value={comentario}
                      onChange={(e) => setComentario(e.target.value)}
                      placeholder="¿Qué te pareció el producto?"
                      className="w-full border border-gray-300 rounded-lg p-3 text-sm focus:outline-none focus:border-[#4A4A40] focus:ring-1 focus:ring-[#4A4A40] min-h-[100px] resize-none"
                      required
                    />
                  </div>

                  {reviewStatus === "error" && (
                    <div className="mb-4 p-3 bg-red-50 text-red-600 text-xs rounded border border-red-100">
                      {errorMsg || "Hubo un error al enviar tu reseña."}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={reviewStatus === "submitting"}
                    className="w-full bg-[#4A4A40] text-white py-3 rounded-full text-sm font-bold hover:bg-[#3E3E35] transition disabled:opacity-70 disabled:cursor-not-allowed"
                  >
                    {reviewStatus === "submitting" ? "Enviando..." : "Enviar Reseña"}
                  </button>
                  
                  <p className="text-[10px] text-gray-400 mt-3 text-center">
                    * Solo usuarios que compraron el producto pueden opinar.
                  </p>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* RELACIONADOS */}
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