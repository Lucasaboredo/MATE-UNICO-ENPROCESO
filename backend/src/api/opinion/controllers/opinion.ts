/**
 * opinion controller
 */
import { factories } from '@strapi/strapi';

export default factories.createCoreController('api::opinion.opinion', ({ strapi }) => ({
  async create(ctx) {
    const user = ctx.state.user;
    if (!user) return ctx.unauthorized("Debes iniciar sesión.");

    const { data } = ctx.request.body;
    // Forzamos a número por si llega como string "5"
    const productoId = Number(data.producto);

    if (!productoId) return ctx.badRequest("El producto es obligatorio.");

    console.log("---------------------------------------------------");
    console.log(`🔎 [DEBUG OPINION] Validando reseña.`);
    console.log(`👤 Usuario ID: ${user.id} (${user.username})`);
    console.log(`🛍️ Producto a reseñar ID: ${productoId}`);

    // 1. Buscamos las órdenes pagadas del usuario
    const ordenes = await strapi.db.query('api::orden.orden').findMany({
      where: {
        cliente: user.id,
        estado: 'pagado', // OJO: Debe coincidir exacto con el enum en la DB
      },
    });

    console.log(`📦 Órdenes 'pagadas' encontradas: ${ordenes.length}`);

    // 2. Revisamos si el producto está en alguna de esas órdenes
    const comproProducto = ordenes.some((orden) => {
      const items = (orden.items as any[]) || [];
      
      // Imprimimos los items para ver qué estructura tienen realmente
      console.log(`   📄 Orden #${orden.id} tiene ${items.length} items:`, JSON.stringify(items));
      
      return items.some((item) => {
        // Chequeamos productId (y forzamos número para comparar)
        const idEnItem = Number(item.productId || item.id); 
        return idEnItem === productoId;
      });
    });

    if (!comproProducto) {
      console.log("❌ [FALLÓ] No se encontró el ID del producto en los items de las órdenes.");
      console.log("---------------------------------------------------");
      return ctx.forbidden("Solo puedes reseñar productos que has comprado.");
    }

    console.log("✅ [ÉXITO] Compra verificada. Creando reseña...");
    console.log("---------------------------------------------------");

    // 3. Crear la reseña pendiente
    const newOpinion = await strapi.entityService.create('api::opinion.opinion', {
      data: {
        ...data,
        usuario: user.id,
        estado: 'pendiente',
        publishedAt: null,
      },
    });

    return this.transformResponse(newOpinion);
  },
}));