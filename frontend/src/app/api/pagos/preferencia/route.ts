export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { MercadoPagoConfig, Preference } from "mercadopago";

const client = new MercadoPagoConfig({
  accessToken: process.env.MP_ACCESS_TOKEN!,
});

const preferenceClient = new Preference(client);

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { orderId, items } = body;

    // 🕵️ CHISMOSO: Vamos a ver qué llega exactamente
    console.log("📦 ITEMS RECIBIDOS:", JSON.stringify(items, null, 2));

    if (!orderId || !items || items.length === 0) {
      return NextResponse.json(
        { error: "Datos incompletos" },
        { status: 400 }
      );
    }

    // 👇 MAPEO A PRUEBA DE ERRORES
    // Busca 'quantity' O 'cantidad'. Busca 'title' O 'nombre'.
    const mpItems = items.map((item: any) => {
      const cantidad = Number(item.quantity || item.cantidad);
      const precio = Number(item.unit_price || item.precioUnitario);
      const titulo = item.title || item.nombre || "Producto sin nombre";

      if (!cantidad || cantidad <= 0) {
        throw new Error(`Item "${titulo}" tiene cantidad inválida: ${cantidad}`);
      }

      return {
        title: titulo,
        quantity: cantidad,
        unit_price: precio,
        currency_id: "ARS",
      };
    });

    const preference = {
      items: mpItems,
      external_reference: String(orderId),
      notification_url: "https://wade-unmesmeric-unsomnolently.ngrok-free.dev/api/webhook/recibir-pago", // 👈 Tu Ngrok (singular: webhook sin content-type)
      back_urls: {
        success: `${process.env.NEXT_PUBLIC_SITE_URL}/checkout/exito`,
        failure: `${process.env.NEXT_PUBLIC_SITE_URL}/checkout/fallo`,
        pending: `${process.env.NEXT_PUBLIC_SITE_URL}/checkout/pago`,
      },
    };

    const response = await preferenceClient.create({
      body: preference,
    });

    // Devolvemos el link de Sandbox si existe
    return NextResponse.json({
      init_point: response.sandbox_init_point || response.init_point,
    });

  } catch (error: any) {
    console.error("❌ ERROR MP:", error); // Muestra el error completo

    // Si Mercado Pago nos da detalles, los mostramos
    if (error.cause) {
      console.error("🔍 CAUSA DEL ERROR:", JSON.stringify(error.cause, null, 2));
    }

    return NextResponse.json(
      { error: "Error creando preferencia" },
      { status: 500 }
    );
  }
}