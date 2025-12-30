export default {
  routes: [
    {
      method: "POST",
      path: "/pago/preferencia",
      handler: "api::pago.pago.crearPreferencia",
      config: { auth: false },
    },
    {
      method: "POST",
      path: "/pago/webhook",
      handler: "api::pago.pago.webhook",
      config: { auth: false },
    },
    // 👇 RUTAS DE REDIRECCIÓN (NUEVAS)
    {
      method: "GET", // Son GET porque el navegador entra ahí
      path: "/pago/exito",
      handler: "api::pago.pago.exito",
      config: { auth: false },
    },
    {
      method: "GET",
      path: "/pago/error",
      handler: "api::pago.pago.error",
      config: { auth: false },
    },
    {
      method: "GET",
      path: "/pago/pendiente",
      handler: "api::pago.pago.pendiente",
      config: { auth: false },
    },
  ],
};