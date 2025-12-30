"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/lib/authContext";
import { fetchFromStrapi } from "@/lib/api";

export default function GoogleRedirect() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { login } = useAuth();
    const [error, setError] = useState("");

    useEffect(() => {
        const authenticate = async () => {
            // Strapi devuelve el access_token en la URL
            const accessToken = searchParams.get("access_token");

            if (!accessToken) {
                setError("No se recibió token de Google.");
                return;
            }

            try {
                // Intercambiamos el access_token de Google por credenciales de Strapi
                // Nota: Strapi maneja esto en /api/auth/google/callback con los params
                const res = await fetch(`http://localhost:1337/api/auth/google/callback?access_token=${accessToken}`);
                const data = await res.json();

                if (data.jwt && data.user) {
                    // ¡Login Exitoso! Guardamos en contexto
                    login(data.jwt, data.user);
                } else {
                    setError("Error al autenticar con el servidor.");
                }
            } catch (err) {
                console.error(err);
                setError("Ocurrió un error de conexión.");
            }
        };

        authenticate();
    }, [searchParams, login]);

    if (error) {
        return (
            <div className="h-screen flex flex-col items-center justify-center text-red-600">
                <h2 className="text-xl font-bold">Error de Autenticación</h2>
                <p>{error}</p>
                <button onClick={() => router.push('/login')} className="mt-4 underline">Volver al Login</button>
            </div>
        );
    }

    return (
        <div className="h-screen flex items-center justify-center bg-[#FCFAF6]">
            <div className="animate-pulse flex flex-col items-center">
                <div className="w-12 h-12 border-4 border-[#5F6B58] border-t-transparent rounded-full animate-spin mb-4"></div>
                <p className="text-[#5F6B58] font-medium">Autenticando...</p>
            </div>
        </div>
    );
}