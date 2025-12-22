import { factories } from '@strapi/strapi';
import { MercadoPagoConfig, Payment } from 'mercadopago';

const client = new MercadoPagoConfig({ accessToken: process.env.MP_ACCESS_TOKEN! });
const payment = new Payment(client);

// 👇 DEFINIMOS EL TIPO EXACTO AQUÍ PARA QUE TS NO SE QUEJE
type EstadoOrden = 'pendiente' | 'pagado' | 'fallido';

export default {
    async webhook(ctx: any) {
        try {
            const query = ctx.request.query;
            const body = ctx.request.body;

            let paymentId = body?.data?.id || query?.id;
            let type = body?.type || query?.topic;

            // console.log(`🔔 Webhook recibido. ID: ${paymentId}, Type: ${type}`);

            if (type === 'payment' || type === 'merchant_order') {
                if (!paymentId && type === 'payment') {
                    return ctx.send('Falta ID', 400);
                }

                const paymentInfo = await payment.get({ id: paymentId });
                const externalReference = paymentInfo.external_reference;
                const statusMP = paymentInfo.status;

                // 👇 AQUÍ ESTABA EL ERROR: LE PONEMOS EL TIPO EXPLÍCITO
                let nuevoEstado: EstadoOrden = 'pendiente';

                if (statusMP === 'approved') {
                    nuevoEstado = 'pagado';
                } else if (statusMP === 'rejected' || statusMP === 'cancelled') {
                    nuevoEstado = 'fallido';
                }

                // Convertimos ID a número para Strapi
                const ordenId = Number(externalReference);

                // Verificamos si existe la orden
                const orden = await strapi.entityService.findOne('api::orden.orden', ordenId);

                if (orden) {
                    await strapi.entityService.update('api::orden.orden', ordenId, {
                        data: {
                            status: nuevoEstado, // Ahora TS sabe que esto es seguro ✅
                            payment_id: String(paymentId),
                        },
                    });
                    console.log(`✅ Orden #${ordenId} actualizada a: ${nuevoEstado}`);
                } else {
                    console.log(`⚠️ Orden #${ordenId} no encontrada.`);
                }
            }

            ctx.send('OK', 200);

        } catch (error) {
            console.error('❌ Error en Webhook:', error);
            ctx.send('Error interno', 500);
        }
    }
};