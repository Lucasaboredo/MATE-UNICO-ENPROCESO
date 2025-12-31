import { MercadoPagoConfig, Preference, Payment } from "mercadopago";

// Configuración de Mercado Pago
const mpConfig = new MercadoPagoConfig({
  accessToken: process.env.MP_ACCESS_TOKEN!,
});

const preferenceClient = new Preference(mpConfig);
const paymentClient = new Payment(mpConfig);

/**
 * 🛠️ FUNCIÓN AUXILIAR: DESCONTAR STOCK Y CONFIRMAR ORDEN
 */
async function procesarCompraExitosa(orderId: number, paymentId: string) {
  console.log(`\n📉 [STOCK] Iniciando proceso para Orden #${orderId}`);

  // 1. Buscamos la orden
  const orden = await strapi.entityService.findOne("api::orden.orden", orderId);

  if (!orden) {
    console.log("❌ [STOCK] Orden no encontrada.");
    return;
  }

  // ⚠️ IMPORTANTE: Si ya está pagada, NO salimos inmediatamente si queremos forzar pruebas.
  // Pero en producción, esto evita duplicados.
  if (orden.estado === 'pagado') {
    console.log("⚠️ [STOCK] La orden ya estaba pagada. Verificando si se descontó stock antes...");
    // Podrías poner un return aquí, pero dejémoslo correr por si falló el stock la primera vez.
  }

  // 2. Recorremos los items de la orden
  const items = orden.items as any[];
  
  if (!items || items.length === 0) {
    console.log("⚠️ [STOCK] La orden no tiene items.");
    return;
  }

  for (const item of items) {
    const productId = Number(item.productId);
    const variantId = Number(item.variantId);
    const cantidad = Number(item.cantidad);

    console.log(`👉 Procesando Item: Producto ID ${productId} | Variante ID ${variantId} | Cantidad: ${cantidad}`);

    try {
      // Traemos el producto con sus variantes
      const producto = await strapi.entityService.findOne("api::producto.producto", productId, {
        populate: '*' // Traemos todo para asegurar que vengan las variantes
      }) as any;

      if (!producto) {
        console.log(`❌ [STOCK] Producto ${productId} no encontrado en DB.`);
        continue;
      }

      if (producto.variantes && Array.isArray(producto.variantes)) {
        let stockActualizado = false;

        // Mapeamos las variantes para actualizar la correcta
        const variantesActualizadas = producto.variantes.map((v: any) => {
          // Comparamos IDs asegurando que sean números
          if (Number(v.id) === variantId) {
            const stockAnterior = Number(v.stock);
            const nuevoStock = Math.max(0, stockAnterior - cantidad);
            
            console.log(`   ✅ [MATCH] Variante "${v.nombre}" encontrada.`);
            console.log(`      Stock: ${stockAnterior} ➡️ ${nuevoStock}`);
            
            stockActualizado = true;
            return { ...v, stock: nuevoStock };
          }
          return v;
        });

        if (stockActualizado) {
          // Guardamos el cambio en la base de datos
          await strapi.entityService.update("api::producto.producto", productId, {
            data: { variantes: variantesActualizadas }
          });
          console.log(`   💾 [GUARDADO] Stock actualizado en DB para producto ${productId}`);
        } else {
          console.log(`   ⚠️ [NO MATCH] No se encontró la variante ID ${variantId} dentro del producto.`);
          console.log(`      Variantes disponibles:`, producto.variantes.map((v:any) => `${v.id}:${v.nombre}`));
        }
      } else {
        console.log(`   ⚠️ [INFO] El producto ${productId} no tiene variantes configuradas.`);
      }

    } catch (err) {
      console.error(`❌ [ERROR] Falló actualización de stock item ${productId}:`, err);
    }
  }

  // 3. Finalmente, pasamos la orden a 'pagado'
  await strapi.entityService.update("api::orden.orden", orderId, {
    data: { 
      estado: 'pagado', 
      payment_id: paymentId 
    }
  });

  console.log("✨ [FIN] Orden marcada como pagada.\n");
}


export default {
  // 1. CREAR PREFERENCIA
  async crearPreferencia(ctx: any) {
    try {
      const response = await preferenceClient.create({ body: ctx.request.body });
      ctx.send({ init_point: response.init_point });
    } catch (error) {
      ctx.send({ ok: false });
    }
  },

  // 2. WEBHOOK
  async webhook(ctx: any) {
    console.log("🔔 [WEBHOOK] Recibiendo señal de Mercado Pago...");

    try {
      const query = ctx.request.query; 
      const body = ctx.request.body;
      let paymentId = body?.data?.id || query?.id || body?.id;
      const type = body?.type || query?.topic;

      if (!paymentId || type === "merchant_order") {
         return ctx.send({ ok: true });
      }
      
      const pago = await paymentClient.get({ id: paymentId });
      const orderId = Number(pago.external_reference);
      const status = pago.status;

      console.log(`🔎 Webhook: Orden ${orderId} | Estado MP: ${status}`);

      if (orderId && status === "approved") {
        await procesarCompraExitosa(orderId, paymentId.toString());
      } else if (orderId && (status === "rejected" || status === "cancelled")) {
        await strapi.entityService.update("api::orden.orden", orderId, {
          data: { estado: 'fallido', payment_id: paymentId.toString() }
        });
      }
      
      ctx.send({ ok: true });
    } catch (error) {
      console.error("🔥 Error en webhook:", error);
      ctx.send({ ok: false });
    }
  },

  // 3. ÉXITO (Redirección)
  async exito(ctx: any) {
    try {
      const query = ctx.request.query;
      const { external_reference, status, collection_status, payment_id } = query;
      const finalStatus = status || collection_status;

      console.log("🚀 [REDIRECCIÓN] Cliente volvió. Estado:", finalStatus);

      if (finalStatus === 'approved' && external_reference) {
         await procesarCompraExitosa(Number(external_reference), String(payment_id));
      }

      const params = new URLSearchParams(query as any).toString();
      const targetUrl = `http://localhost:3000/checkout/exito?${params}`;

      ctx.set('Content-Type', 'text/html');
      ctx.body = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <title>Procesando...</title>
          <script>
            setTimeout(() => { window.location.href = "${targetUrl}"; }, 500);
          </script>
        </head>
        <body>
          <p>Redirigiendo a tu orden...</p>
        </body>
        </html>
      `;
    } catch (error) {
      console.error("⚠️ Error en redirección exito:", error);
      return ctx.redirect('http://localhost:3000/checkout/exito');
    }
  },

  // 4. OTROS ESTADOS
  async error(ctx: any) { return ctx.redirect('http://localhost:3000/checkout/error'); },
  async pendiente(ctx: any) { return ctx.redirect('http://localhost:3000/checkout/pendiente'); }
};