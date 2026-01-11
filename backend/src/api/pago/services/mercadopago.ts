import { MercadoPagoConfig, Preference, Payment } from "mercadopago";

const mpConfig = new MercadoPagoConfig({
  accessToken: process.env.MP_ACCESS_TOKEN!,
});

const preferenceClient = new Preference(mpConfig);
const paymentClient = new Payment(mpConfig);

export async function crearPreferenciaMP(body: any) {
  return await preferenceClient.create({ body });
}

export async function obtenerPagoMP(paymentId: string | number) {
  return await paymentClient.get({ id: paymentId });
}

export async function procesarCompraExitosa(orderId: number, paymentId: string) {
  console.log(`\n🚀 [STOCK] Procesando Orden #${orderId} con Lógica "Split Exacto"`);

  // @ts-ignore
  const orden = (await strapi.entityService.findOne("api::orden.orden", orderId)) as any;
  
  // 1. PROTECCIÓN CONTRA DOBLE COBRO (Fundamental)
  if (!orden) return console.error("❌ Orden no encontrada.");
  if (orden.estado === "pagado") {
     console.log("🛑 La orden ya fue procesada anteriormente. No se descuenta stock de nuevo.");
     return;
  }

  const items = orden.items || [];

  for (const item of items) {
    const productId = Number(item.productId);
    const variantIdBuscado = Number(item.variantId);
    const cantidad = Number(item.cantidad);
    const nombreItem = item.nombre || ""; // Ej: "Mate Loco - Negro"

    try {
      // @ts-ignore
      const producto = (await strapi.entityService.findOne("api::producto.producto", productId, {
        populate: "variantes",
      })) as any;

      if (!producto || !producto.variantes) continue;

      let varianteEncontrada = null;

      // ---------------------------------------------------------
      // ESTRATEGIA 1: ID EXACTO (La ideal)
      // ---------------------------------------------------------
      varianteEncontrada = producto.variantes.find((v: any) => Number(v.id) === variantIdBuscado);

      // ---------------------------------------------------------
      // ESTRATEGIA 2: SPLIT POR GUIÓN (La solución a tu problema)
      // ---------------------------------------------------------
      if (!varianteEncontrada && nombreItem.includes(" - ")) {
        console.log(`   ⚠️ ID ${variantIdBuscado} no match. Intentando separar nombre: "${nombreItem}"`);
        
        // Rompemos "Mate Loco - Negro" y nos quedamos con "Negro"
        const partes = nombreItem.split(" - ");
        const nombreVariantePuro = partes[partes.length - 1].trim().toLowerCase(); // "negro"
        
        console.log(`      🔎 Buscando variante que se llame EXÁCTAMENTE: "${nombreVariantePuro}"`);

        varianteEncontrada = producto.variantes.find((v: any) => 
            (v.nombre || "").trim().toLowerCase() === nombreVariantePuro
        );

        if (varianteEncontrada) {
            console.log(`      🎯 ¡MATCH EXACTO! Encontrada por sufijo: "${varianteEncontrada.nombre}"`);
        }
      }

      // ---------------------------------------------------------
      // ESTRATEGIA 3: BEST MATCH (Fallback por si falla lo anterior)
      // ---------------------------------------------------------
      if (!varianteEncontrada) {
        // Filtramos variantes que estén contenidas en el nombre del item
        const candidatos = producto.variantes.filter((v: any) => {
            const vNombre = (v.nombre || "").trim().toLowerCase();
            return vNombre && nombreItem.toLowerCase().includes(vNombre);
        });

        // Ordenamos por longitud: Preferimos "Negro Intenso" antes que "Negro"
        candidatos.sort((a: any, b: any) => (b.nombre || "").length - (a.nombre || "").length);

        if (candidatos.length > 0) {
            varianteEncontrada = candidatos[0];
            console.log(`      ⚠️ Match aproximado (por contención): "${varianteEncontrada.nombre}"`);
        }
      }

      // ---------------------------------------------------------
      // ESTRATEGIA 4: ÚNICA OPCIÓN (Si solo hay 1 variante en DB)
      // ---------------------------------------------------------
      if (!varianteEncontrada && producto.variantes.length === 1) {
           varianteEncontrada = producto.variantes[0];
           console.log(`      🔧 Producto único detectado. Usando: "${varianteEncontrada.nombre}"`);
      }

      // --- EJECUCIÓN DEL DESCUENTO ---
      if (varianteEncontrada) {
        const stockActual = Number(varianteEncontrada.stock);
        const nuevoStock = Math.max(0, stockActual - cantidad);

        const variantesActualizadas = producto.variantes.map((v: any) => {
          if (v.id === varianteEncontrada.id) {
            return { ...v, stock: nuevoStock };
          }
          return v;
        });

        // @ts-ignore
        await strapi.entityService.update("api::producto.producto", productId, {
          data: { variantes: variantesActualizadas },
        });

        console.log(`   💾 [EXITO] Stock descontado a "${varianteEncontrada.nombre}": ${stockActual} -> ${nuevoStock}`);
      } else {
        console.error(`   ⛔ [FALLO TOTAL] No se encontró variante para "${nombreItem}"`);
      }

    } catch (err) {
      console.error("❌ Error procesando item:", err);
    }
  }

  // Finalizar orden
  // @ts-ignore
  await strapi.entityService.update("api::orden.orden", orderId, {
    data: { estado: "pagado", payment_id: paymentId, fecha_pago: new Date() },
  });
}

export async function marcarOrdenFallida(orderId: number, paymentId: string, status?: string) {
  // @ts-ignore
  await strapi.entityService.update("api::orden.orden", orderId, {
    data: {
      estado: "fallido",
      payment_id: paymentId,
      payment_status: status || "rejected",
    },
  });
}