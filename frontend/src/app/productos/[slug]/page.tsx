import { fetchFromStrapi } from "@/lib/api";
import ProductoDetalleView from "./ProductoDetalleView";
import { notFound } from "next/navigation";

interface Props {
  params: Promise<{
    slug: string;
  }>;
}

export default async function Page({ params }: Props) {
  const { slug } = await params;

  try {
    // AHORA SÍ: Usamos populate[opinions] (en inglés y plural)
    const productoRes = await fetchFromStrapi(
      `/productos?filters[slug][$eq]=${slug}&populate[imagen]=true&populate[variantes]=true&populate[opinions]=true`
    );

    const producto = productoRes.data?.[0];

    if (!producto) {
      return notFound();
    }

    const destacadosRes = await fetchFromStrapi(
      `/productos?filters[destacado][$eq]=true&filters[slug][$ne]=${slug}&pagination[limit]=3&populate=imagen`
    );

    const relacionados = destacadosRes.data || [];

    // AGREGA ESTO ANTES DEL RETURN:
    if (producto.opinions && producto.opinions.length > 0) {
      console.log("------------------------------------------------");
      console.log("🕵️ DETALLE DE LA OPINIÓN (Mirar nombres de campos):");
      console.log(JSON.stringify(producto.opinions[0], null, 2));
      console.log("------------------------------------------------");
    }

    return (
      <ProductoDetalleView
        producto={producto}
        relacionados={relacionados}
      />
    );
  } catch (error) {
    console.error("Error cargando producto:", error);
    return notFound();
  }
}