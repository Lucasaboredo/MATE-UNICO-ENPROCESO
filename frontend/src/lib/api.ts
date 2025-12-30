// src/lib/api.ts

// Usamos 127.0.0.1 para máxima compatibilidad
const API_URL = "http://127.0.0.1:1337";

export async function fetchFromStrapi(path: string, options: RequestInit = {}) {
  // 1. Aseguramos que el path empiece con "/"
  let cleanPath = path.startsWith("/") ? path : `/${path}`;

  // 2. AUTO-CORRECCIÓN INTELIGENTE:
  // Si la ruta NO empieza con "/api" y NO es una imagen ("/uploads"),
  // se lo agregamos automáticamente.
  if (!cleanPath.startsWith("/api") && !cleanPath.startsWith("/uploads")) {
    cleanPath = `/api${cleanPath}`;
  }

  // Construimos la URL final
  const fullUrl = `${API_URL}${cleanPath}`;

  console.log(`📡 Conectando a Strapi: ${fullUrl}`);

  try {
    const res = await fetch(fullUrl, {
      headers: {
        "Content-Type": "application/json",
        // Token si lo necesitaras en el futuro:
        // "Authorization": `Bearer ${process.env.STRAPI_API_TOKEN}` 
      },
      ...options,
      cache: "no-store", // Evitamos caché viejo
    });

    if (!res.ok) {
      // Si falla, mostramos el error claro en la consola
      console.error(`❌ Error ${res.status} en la petición a: ${fullUrl}`);
      throw new Error(`Error ${res.status} al conectar con Strapi`);
    }

    const data = await res.json();
    return data;

  } catch (error) {
    // Error de red (Strapi apagado o URL mal escrita)
    console.error(`🔥 ERROR CRÍTICO DE CONEXIÓN: ${fullUrl}`);
    throw error;
  }
}