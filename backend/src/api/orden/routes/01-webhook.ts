export default {
    routes: [
        {
            method: 'POST',
            path: '/mercadopago-webhook',
            // 👇 AQUÍ ESTÁ LA MAGIA: NombreDelArchivo.NombreDeLaFuncion
            handler: 'mp-webhook.procesar',
            config: {
                auth: false,
            },
        },
    ],
};