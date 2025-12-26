// src/app/faq/page.tsx
import { fetchFromStrapi } from "@/lib/api";

/* =========================
   TIPOS
========================= */
type Block = {
  type: string;
  children?: { type: string; text?: string }[];
};

type Seccion = {
  id: number;
  titulo: string;
  descripcion: Block[] | null;
};

type FAQEntry = {
  secciones: Seccion[];
  imagen_footer?: {
    url: string;
  };
};

export default async function FAQPage() {
  // Collection type → usamos la primera entrada
  const res = await fetchFromStrapi("/faq-pages?populate=*");
  const faq: FAQEntry | undefined = res?.data?.[0];

  if (!faq) {
    return (
      <div className="p-10 text-center text-red-500">
        No hay contenido de FAQ cargado.
      </div>
    );
  }

  const STRAPI_URL =
    process.env.NEXT_PUBLIC_API_URL?.replace("/api", "") ||
    "http://localhost:1337";

  const footerImage =
    faq.imagen_footer?.url &&
    (faq.imagen_footer.url.startsWith("http")
      ? faq.imagen_footer.url
      : `${STRAPI_URL}${faq.imagen_footer.url}`);

  return (
    <section className="w-full px-6 py-32">
      {/* CONTENIDO FAQ */}
      <div className="max-w-6xl mx-auto">
        {/* TÍTULO PRINCIPAL */}
        <h1 className="text-4xl md:text-5xl font-semibold text-center mb-24">
          Preguntas Frecuentes
        </h1>

        <div className="space-y-20">
          {faq.secciones.map((sec) => (
            <div key={sec.id}>
              {/* TÍTULO DE SECCIÓN */}
              <h2 className="text-2xl md:text-3xl font-semibold mb-5">
                {sec.titulo}
              </h2>

              {/* TEXTO */}
              <div className="space-y-4">
                {renderDescripcion(sec.descripcion)}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* IMAGEN GRANDE ABAJO */}
      {footerImage && (
        <div className="mt-44">
          <img
            src={footerImage}
            alt="Mate"
            className="w-full max-w-7xl mx-auto rounded-lg"
          />
        </div>
      )}
    </section>
  );
}

/* =========================
   RENDER RICH TEXT (STRAPI)
========================= */
function renderDescripcion(blocks: Block[] | null) {
  if (!blocks) return null;

  return blocks.map((block, i) => {
    if (block.type !== "paragraph") return null;

    const text =
      block.children?.map((child) => child.text).join("") ?? "";

    if (!text.trim()) return null;

    return (
      <p
        key={i}
        className="text-lg md:text-xl lg:text-2xl text-gray-700 leading-relaxed"
      >
        {text}
      </p>
    );
  });
}
