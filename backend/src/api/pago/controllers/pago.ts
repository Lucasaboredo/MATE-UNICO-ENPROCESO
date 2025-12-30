import { MercadoPagoConfig, Preference, Payment } from "mercadopago";

const mpConfig = new MercadoPagoConfig({
  accessToken: process.env.MP_ACCESS_TOKEN!,
});

const preferenceClient = new Preference(mpConfig);
const paymentClient = new Payment(mpConfig);

export default {
  // 1. CREAR PREFERENCIA
  async crearPreferencia(ctx) {
    try {
      const response = await preferenceClient.create({ body: ctx.request.body });
      ctx.send({ init_point: response.init_point });
    } catch (error) {
      ctx.send({ ok: false });
    }
  },

  // 2. WEBHOOK (Con logs de diagnóstico para detectar errores)
  async webhook(ctx) {
    console.log("🔔 [WEBHOOK] Recibiendo señal de Mercado Pago...");

    try {
      const query = ctx.request.query; 
      const body = ctx.request.body;
      
      console.log("📩 Datos recibidos:", JSON.stringify({ query, body }));

      let paymentId = body?.data?.id || query?.id || body?.id;
      const type = body?.type || query?.topic;

      if (!paymentId) {
         console.log("⚠️ No se encontró ID de pago en la notificación.");
         return ctx.send({ ok: true });
      }

      if (type === "merchant_order") {
         return ctx.send({ ok: true });
      }
      
      console.log(`🔎 Consultando pago en MP: ${paymentId}`);
      const pago = await paymentClient.get({ id: paymentId });
      
      const orderId = pago.external_reference;
      const status = pago.status;
      
      console.log(`✅ Pago encontrado. Estado: ${status}. Orden asociada: ${orderId}`);

      if (orderId) {
        let estado: "pendiente" | "pagado" | "fallido" = "pendiente";
        if (status === "approved") estado = "pagado";
        if (status === "rejected" || status === "cancelled") estado = "fallido";

        console.log(`💾 Actualizando Orden #${orderId} a estado: ${estado}`);
        
        await strapi.entityService.update("api::orden.orden", Number(orderId), {
          data: { estado, payment_id: paymentId.toString() }
        });
        
        console.log("✨ ¡Orden actualizada con éxito vía Webhook!");
      }
      
      ctx.send({ ok: true });
    } catch (error) {
      console.error("🔥 Error en webhook:", error);
      ctx.send({ ok: false });
    }
  },

  // 3. ÉXITO (EL SALVAVIDAS: Actualiza la orden al volver al sitio)
  async exito(ctx) {
    try {
      // Mercado Pago devuelve datos en la URL: ?collection_status=approved&external_reference=123...
      const { external_reference, status, collection_status, payment_id } = ctx.request.query;
      
      // A veces llega como 'status' y a veces como 'collection_status'
      const finalStatus = status || collection_status;

      console.log("🚀 [REDIRECCIÓN] Cliente volvió de Mercado Pago");
      console.log(`Datos: Orden ${external_reference} | Estado: ${finalStatus}`);

      // Si está aprobado, actualizamos la orden YA MISMO
      if (finalStatus === 'approved' && external_reference) {
        console.log(`💾 Forzando actualización de Orden #${external_reference} a PAGADO`);
        
        await strapi.entityService.update("api::orden.orden", Number(external_reference), {
          data: { 
            estado: 'pagado', 
            payment_id: String(payment_id) 
          }
        });
        
        console.log("✅ ¡Orden actualizada vía Redirección (Plan B)!");
      }

    } catch (error) {
      console.error("⚠️ Error intentando actualizar en redirección:", error);
    }

    // Finalmente enviamos al usuario al frontend
    ctx.redirect('http://localhost:3000/checkout/exito');
  },

  // 4. OTROS ESTADOS
  async error(ctx) { 
    ctx.redirect('http://localhost:3000/checkout/error'); 
  },
  
  async pendiente(ctx) { 
    ctx.redirect('http://localhost:3000/checkout/pendiente'); 
  }
};