/**
 * orden controller
 */

import { factories } from '@strapi/strapi';

export default factories.createCoreController('api::orden.orden', ({ strapi }) => ({

    async findMine(ctx) {
        const user = ctx.state.user;

        // Log para depurar
        console.log("🔍 Usuario solicitante:", user?.id);

        if (!user) {
            return ctx.unauthorized('No estás autenticado');
        }

        try {
            // ✅ USAMOS ENTITY SERVICE DIRECTO (Más robusto)
            // Esto evita el error 400 porque nos saltamos la validación HTTP estricta
            const data = await strapi.entityService.findMany('api::orden.orden', {
                filters: {
                    cliente: user.id
                },
                sort: { createdAt: 'desc' },
                // Los campos JSON (items, shipping) vienen activados por defecto aquí
            });

            // Si no hay datos, devolvemos array vacío
            if (!data) {
                return { data: [] };
            }

            // IMPORTANTE: Transformamos la respuesta para que el Frontend la entienda
            // Strapi v4 espera { data: [ { id: 1, attributes: ... } ] } si usas REST estándar,
            // pero entityService devuelve objetos planos [ { id: 1, items: ... } ].
            // Para simplificar tu vida y que tu frontend (orden.items) funcione directo:

            // Devolvemos estructura compatible con tu frontend actual
            const sanitizedData = await this.sanitizeOutput(data, ctx);
            return { data: sanitizedData };

        } catch (error) {
            console.error("🔥 Error en findMine:", error);
            return ctx.badRequest("Error al buscar órdenes");
        }
    }
}));