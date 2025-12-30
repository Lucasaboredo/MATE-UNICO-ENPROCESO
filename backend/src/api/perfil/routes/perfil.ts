export default {
    routes: [
        {
            method: 'PUT',
            path: '/perfil/me',
            handler: 'api::perfil.perfil.updateMe',
            config: {
                auth: false, // <--- ⚠️ ESTO ES LA CLAVE. Lo hacemos público temporalmente.
                policies: [],
                middlewares: [],
            },
        },
    ],
};