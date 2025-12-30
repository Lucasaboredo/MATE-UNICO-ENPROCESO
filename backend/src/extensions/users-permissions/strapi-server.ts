module.exports = (plugin) => {
    // 1. CREAMOS EL CONTROLADOR 'updateMe'
    plugin.controllers.user.updateMe = async (ctx) => {
        if (!ctx.state.user || !ctx.state.user.id) {
            return ctx.unauthorized();
        }

        // Filtramos solo los campos permitidos para evitar que se cambien cosas como 'blocked' o 'role'
        const allowedData = {};
        const body = ctx.request.body;
        const camposPermitidos = ['telefono', 'direccion', 'ciudad', 'provincia', 'codigoPostal', 'username'];

        camposPermitidos.forEach(field => {
            if (body[field] !== undefined) allowedData[field] = body[field];
        });

        // Actualizamos el usuario
        await strapi.entityService.update('plugin::users-permissions.user', ctx.state.user.id, {
            data: allowedData,
        });

        // Devolvemos el usuario actualizado
        const updatedUser = await strapi.entityService.findOne('plugin::users-permissions.user', ctx.state.user.id, {
            populate: '*', // Traer todo por si acaso
        });

        ctx.body = updatedUser;
    };

    // 2. CREAMOS LA RUTA 'PUT /users/me'
    plugin.routes['content-api'].routes.push({
        method: 'PUT',
        path: '/users/me',
        handler: 'user.updateMe',
        config: {
            prefix: '',
            policies: [],
        },
    });

    return plugin;
};