import { MercadoPagoConfig, Payment } from 'mercadopago';

const client = new MercadoPagoConfig({ accessToken: process.env.MP_ACCESS_TOKEN! });
const payment = new Payment(client);

type EstadoOrden = 'pendiente' | 'pagado' | 'fallido';

export default {
    async procesar(ctx: any) { // Le llamamos 'procesar' a la función
        try {
            const query = ctx.request.query;
            const body = ctx.request.body;
            let paymentId = body?.data?.id || query?.id;
            let type = body?.type || query?.topic;

            // console.log(`🔔 Webhook Dedicado. ID: ${paymentId}, Type: ${type}`);

            if (type === 'payment' || type === 'merchant_order') {
                if (!paymentId && type === 'payment') return ctx.send('Falta ID', 400);

                const paymentInfo = await payment.get({ id: paymentId });
                const externalReference = paymentInfo.external_reference;
                const statusMP = paymentInfo.status;

                let nuevoEstado: EstadoOrden = 'pendiente';
                if (statusMP === 'approved') nuevoEstado = 'pagado';
                else if (statusMP === 'rejected' || statusMP === 'cancelled') nuevoEstado = 'fallido';

                const ordenId = Number(externalReference);

                // Usamos strapi.entityService para buscar/actualizar la orden
                const orden = await strapi.entityService.findOne('api::orden.orden', ordenId);

                if (orden) {
                    await strapi.entityService.update('api::orden.orden', ordenId, {
                        data: {
                            status: nuevoEstado,
                            payment_id: String(paymentId),
                        },
                    });
                    console.log(`✅ Orden #${ordenId} actualizada a: ${nuevoEstado}`);
                }
            }
            ctx.send('OK', 200);
        } catch (error) {
            console.error('❌ Error Webhook:', error);
            ctx.send('Error', 500);
        }
    }
};