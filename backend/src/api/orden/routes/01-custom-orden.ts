export default {
    routes: [
        {
            method: 'GET',
            path: '/ordens/mis-ordenes',
            handler: 'orden.findMine',
            config: {
                policies: [],
                middlewares: [],
            },
        },
    ],
};