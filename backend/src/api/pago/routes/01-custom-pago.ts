export default {
    routes: [
        {
            method: 'POST',
            // 👇 CAMBIO CLAVE: Usamos un nombre específico para evitar choques con IDs
            path: '/notificacion-mp',
            handler: 'pago.webhook',
            config: {
                auth: false, // 100% público
            },
        },
    ],
};