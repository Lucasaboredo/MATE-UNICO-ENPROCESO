import { factories } from '@strapi/strapi';

export default factories.createCoreController('api::opinion.opinion', ({ strapi }) => ({
  async create(ctx) {
    const user = ctx.state.user;
    if (!user) return ctx.unauthorized("Debes iniciar sesión.");

    const { data } = ctx.request.body;
    const productoId = data.producto;

    if (!productoId) return ctx.badRequest("El producto es obligatorio.");

    // 1. Buscamos el producto actual para saber su nombre
    // @ts-ignore
    const productoActual = await strapi.entityService.findOne('api::producto.producto', productoId);
    if (!productoActual) return ctx.notFound("El producto que intentas reseñar no existe.");

    const nombreProductoActual = (productoActual.nombre || "").trim().toLowerCase();

    // 2. Traemos órdenes pagadas del usuario
    // @ts-ignore
    const ordenes = await strapi.db.query('api::orden.orden').findMany({
      where: {
        cliente: user.id,
        estado: 'pagado', 
      },
    });

    // 3. VERIFICACIÓN DOBLE (ID Exacto O Nombre Coincidente)
    const comproProducto = ordenes.some((orden: any) => {
      let items = orden.items;

      // --- Limpieza de datos (Parseo seguro) ---
      if (typeof items === 'string') {
        try { items = JSON.parse(items); } catch (e) { return false; }
      }
      if (typeof items === 'string') { // Doble check por si acaso
        try { items = JSON.parse(items); } catch (e) { return false; }
      }
      if (!Array.isArray(items)) items = [items];
      // -----------------------------------------

      return items.some((item: any) => {
        if (!item) return false;

        // A) Intento por ID (Lo ideal)
        const idEnOrden = String(item.productId || item.id || '');
        if (idEnOrden === String(productoId)) return true;

        // B) Intento por NOMBRE (El salvavidas 🛟)
        // Si el ID cambió, verificamos que el nombre del ítem contenga el nombre del producto
        const nombreEnOrden = (item.nombre || "").trim().toLowerCase();
        
        // Ej: "Mate Imperial - Negro" incluye "Mate Imperial" -> TRUE
        if (nombreProductoActual && nombreEnOrden.includes(nombreProductoActual)) {
          return true;
        }

        return false;
      });
    });

    if (!comproProducto) {
      return ctx.forbidden(`No pudimos verificar tu compra. (Tus órdenes: ${ordenes.length}).`);
    }

    // 4. Crear la reseña
    // @ts-ignore
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