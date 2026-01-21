// src/app/faq/page.tsx
import { fetchFromStrapi } from "@/lib/api";

/* =========================
   TIPOS
========================= */
type Block = {
  type: string;
  children?: { type: string; text?: string }[];
};

type ImagenStrapi = {
  url: string;
  width?: number;
  height?: number;
  alternativeText?: string;
};

type Seccion = {
  id: number;
  titulo: string;
  descripcion: Block[] | null;
  icono?: ImagenStrapi;
};

type FAQEntry = {
  secciones: Seccion[];
  imagen_footer?: ImagenStrapi;
};

export default async function FAQPage() {
  // Query corregida y optimizada
  const query = "populate[secciones][populate]=*&populate[imagen_footer]=true";
  const res = await fetchFromStrapi(`/faq-pages?${query}`);
  const faq: FAQEntry | undefined = res?.data?.[0];

  const STRAPI_URL =
    process.env.NEXT_PUBLIC_API_URL?.replace("/api", "") ||
    "http://localhost:1337";

  // Helper para URLs
  const getImageUrl = (img?: ImagenStrapi) => {
    if (!img?.url) return null;
    return img.url.startsWith("http") ? img.url : `${STRAPI_URL}${img.url}`;
  };

  const footerImageUrl = getImageUrl(faq?.imagen_footer);

  if (!faq) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center text-gray-500">
        <p>Cargando preguntas frecuentes...</p>
      </div>
    );
  }

  return (
    <section className="min-h-screen w-full bg-[#FAFAFA] text-[#171717]">
      {/* === HERO SECTION === */}
      <div className="bg-white px-6 pb-16 pt-24 md:pb-24 md:pt-32">
        <div className="mx-auto max-w-3xl text-center">
          <span className="mb-4 inline-block rounded-full bg-gray-100 px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-gray-600">
            Centro de Ayuda
          </span>
          <h1 className="text-4xl font-extrabold tracking-tight md:text-5xl lg:text-6xl">
            Preguntas Frecuentes
          </h1>
          <p className="mt-6 text-lg text-gray-500 md:text-xl">
            Resolvemos tus dudas sobre compras, envíos y personalización para que tu experiencia sea única.
          </p>
        </div>
      </div>

      {/* === LISTA ACORDEÓN === */}
      <div className="mx-auto max-w-3xl px-6 pb-24">
        <div className="divide-y divide-gray-200 border-t border-gray-200">
          {faq.secciones.map((sec) => {
            const iconUrl = getImageUrl(sec.icono);

            return (
              <details
                key={sec.id}
                className="group py-6 transition-all duration-300"
              >
                {/* CABECERA (Pregunta) */}
                <summary className="flex cursor-pointer list-none items-center justify-between outline-none">
                  <div className="flex items-center gap-4">
                    {/* Ícono opcional */}
                    {iconUrl && (
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gray-100 group-hover:bg-gray-200 transition-colors">
                        <img
                          src={iconUrl}
                          alt=""
                          className="h-5 w-5 object-contain opacity-70"
                        />
                      </div>
                    )}
                    <h3 className="text-lg font-semibold text-[#171717] group-hover:text-green-800 transition-colors md:text-xl">
                      {sec.titulo}
                    </h3>
                  </div>

                  {/* Flecha animada (CSS Puro) */}
                  <span className="ml-4 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-gray-200 transition-transform duration-300 group-open:rotate-180">
                    <svg
                      width="12"
                      height="8"
                      viewBox="0 0 12 8"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M1.5 1.75L6 6.25L10.5 1.75"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </span>
                </summary>

                {/* CONTENIDO (Respuesta) */}
                <div className="mt-4 animate-fadeIn pl-[3.5rem] pr-4 text-base leading-relaxed text-gray-600 md:text-lg">
                  {renderDescripcion(sec.descripcion)}
                </div>
              </details>
            );
          })}
        </div>
      </div>

      {/* === IMAGEN FOOTER (Banner) === */}
      {footerImageUrl && (
        <div className="w-full px-4 pb-12 md:px-6">
          <div className="mx-auto max-w-5xl overflow-hidden rounded-2xl shadow-xl md:rounded-3xl">
            <div className="relative h-[250px] w-full md:h-[400px]">
              <img
                src={footerImageUrl}
                alt="Mate Único"
                className="h-full w-full object-cover transition-transform duration-1000 hover:scale-105"
              />
              <div className="absolute inset-0 bg-black/10" />
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

/* =========================
   RENDER RICH TEXT
========================= */
function renderDescripcion(blocks: Block[] | null) {
  if (!blocks) return null;

  return blocks.map((block, i) => {
    if (block.type !== "paragraph") return null;
    const text = block.children?.map((child) => child.text).join("") ?? "";
    if (!text.trim()) return null;

    return (
      <p key={i} className="mb-3 last:mb-0">
        {text}
      </p>
    );
  });
}