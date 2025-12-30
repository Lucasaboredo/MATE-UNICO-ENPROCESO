export default {
    async updateMe(ctx) {
        let user = null;

        try {
            const { authorization } = ctx.request.header;

            if (authorization && authorization.startsWith('Bearer ')) {
                const token = authorization.replace('Bearer ', '');
                const decoded = await strapi.plugin('users-permissions').service('jwt').verify(token);

                if (decoded && decoded.id) {
                    user = await strapi.entityService.findOne('plugin::users-permissions.user', decoded.id);
                }
            }
        } catch (err) {
            console.log("⚠️ Error verificando token manual:", err);
        }

        if (!user) {
            return ctx.unauthorized("No se pudo verificar tu identidad.");
        }

        const body = ctx.request.body;

        // 👇 Agregamos los campos _facturacion a la lista blanca
        const allowedFields = [
            'nombre', 'apellido', 'telefono', 'username',
            // Envío
            'direccion', 'numero', 'ciudad', 'provincia', 'codigoPostal',
            // Facturación
            'direccion_facturacion', 'numero_facturacion', 'ciudad_facturacion', 'provincia_facturacion', 'cp_facturacion'
        ];

        const dataToUpdate = {};

        allowedFields.forEach((field) => {
            if (body[field] !== undefined) {
                dataToUpdate[field] = body[field];
            }
        });

        try {
            await strapi.entityService.update('plugin::users-permissions.user', user.id, {
                data: dataToUpdate,
            });

            const updatedUser = await strapi.entityService.findOne('plugin::users-permissions.user', user.id);
            return updatedUser;

        } catch (err) {
            console.error("❌ Error al guardar perfil:", err);
            return ctx.badRequest("Error al actualizar perfil en base de datos");
        }
    }
};