// frontend/src/app/api/shipping/route.ts
import { NextResponse } from "next/server";

export async function POST(request: Request) {
    try {
        const { cp } = await request.json();

        if (!cp) {
            return NextResponse.json({ error: "Falta el código postal" }, { status: 400 });
        }

        // --- LÓGICA DE SIMULACIÓN (MOCK) ---
        // Aquí puedes ajustar los precios y zonas como quieras
        const cpNumber = parseInt(cp);
        let precio = 0;
        let demora = "";

        if (isNaN(cpNumber)) {
            return NextResponse.json({ error: "CP inválido" }, { status: 400 });
        }

        if (cpNumber >= 1000 && cpNumber <= 1999) {
            // ZONA 1: CABA y GBA
            precio = 4500;
            demora = "Llega en 2 a 3 días hábiles";
        } else if (cpNumber >= 2000 && cpNumber <= 3999) {
            // ZONA 2: Centro / Litoral
            precio = 6800;
            demora = "Llega en 3 a 5 días hábiles";
        } else if (cpNumber >= 4000) {
            // ZONA 3: Resto del país / Norte / Sur
            precio = 8200;
            demora = "Llega en 5 a 7 días hábiles";
        } else {
            // CP bajos (ej: < 1000)
            precio = 4500;
            demora = "Llega en 2 a 3 días hábiles";
        }

        return NextResponse.json({ price: precio, delay: demora });

    } catch (error) {
        return NextResponse.json({ error: "Error calculando envío" }, { status: 500 });
    }
}