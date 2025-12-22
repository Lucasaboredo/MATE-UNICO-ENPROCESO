/**
 * Rutas personalizadas para webhook de Mercado Pago
 * 
 * Estructura idéntica a 'pago' que funciona correctamente
 */

export default {
    routes: [
        {
            method: 'POST',
            path: '/recibir-pago',
            handler: 'webhook.recibir',
            config: {
                auth: false,
            },
        },
    ],
};

