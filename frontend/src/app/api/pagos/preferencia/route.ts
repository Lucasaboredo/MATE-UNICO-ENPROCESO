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

    if (!orderId || !items) return NextResponse.json({ error: "Datos incompletos" }, { status: 400 });

    // 👇 URL DE NGROK (Asegúrate de que sea la actual)
    const WEBHOOK_URL = "https://nonderogatorily-unconvicted-joni.ngrok-free.dev";

    // 🕵️‍♂️ DETECTOR DE MENTIRAS: Esto imprimirá en la terminal qué URL estamos usando realmente
    console.log("📢 [FRONTEND] Enviando a Mercado Pago esta URL:", WEBHOOK_URL);

    const preference: any = {
      items: items.map((item: any) => ({
        title: item.title,
        quantity: Number(item.quantity),
        unit_price: Number(item.unit_price),
        currency_id: "ARS",
      })),
      external_reference: String(orderId),
      notification_url: `${WEBHOOK_URL}/api/pago/webhook`,

      // 👇 TRUCO: Apuntamos las vueltas al Backend (HTTPS)
      back_urls: {
        success: `${WEBHOOK_URL}/api/pago/exito`,
        failure: `${WEBHOOK_URL}/api/pago/error`,
        pending: `${WEBHOOK_URL}/api/pago/pendiente`,
      },
      auto_return: "approved",
    };

    console.log("🚀 Back URLs apuntando a Ngrok:", preference.back_urls);

    const response = await preferenceClient.create({ body: preference });
    return NextResponse.json({ init_point: response.init_point });

  } catch (error: any) {
    console.error("❌ ERROR:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}