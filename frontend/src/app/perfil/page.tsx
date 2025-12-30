"use client";

import { useAuth } from "@/lib/authContext";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { fetchFromStrapi } from "@/lib/api";

export default function PerfilPage() {
    const { user, token, logout, loading, login } = useAuth();
    const router = useRouter();

    const [tab, setTab] = useState<"compras" | "datos">("compras");
    const [orders, setOrders] = useState<any[]>([]);
    const [loadingOrders, setLoadingOrders] = useState(true);

    // Estados del Formulario (Incluye Facturación y Envío)
    const [formData, setFormData] = useState({
        nombre: "",
        apellido: "",
        email: "",
        telefono: "",

        // Facturación (Personal)
        direccion_facturacion: "",
        numero_facturacion: "",
        ciudad_facturacion: "",
        provincia_facturacion: "",
        cp_facturacion: "",

        // Envío
        direccion: "",
        numero: "",
        ciudad: "",
        provincia: "",
        codigoPostal: "",
    });
    const [saving, setSaving] = useState(false);
    const [msg, setMsg] = useState("");

    useEffect(() => {
        if (!loading && !user) router.push("/login");
    }, [user, loading, router]);

    useEffect(() => {
        if (user) {
            setFormData({
                nombre: user.nombre || "",
                apellido: user.apellido || "",
                email: user.email || "",
                telefono: user.telefono || "",

                direccion_facturacion: user.direccion_facturacion || "",
                numero_facturacion: user.numero_facturacion || "",
                ciudad_facturacion: user.ciudad_facturacion || "",
                provincia_facturacion: user.provincia_facturacion || "",
                cp_facturacion: user.cp_facturacion || "",

                direccion: user.direccion || "",
                numero: user.numero || "",
                ciudad: user.ciudad || "",
                provincia: user.provincia || "",
                codigoPostal: user.codigoPostal || "",
            });
        }
    }, [user]);

    useEffect(() => {
        const loadOrders = async () => {
            if (!token) return;
            try {
                const res = await fetchFromStrapi("/ordens/mis-ordenes", {
                    headers: { Authorization: `Bearer ${token}` },
                });
                setOrders(Array.isArray(res.data) ? res.data : []);
            } catch (error) {
                console.error("Error cargando órdenes", error);
            } finally {
                setLoadingOrders(false);
            }
        };
        if (user) loadOrders();
    }, [token, user]);

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        setMsg("");

        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_STRAPI_URL || "http://localhost:1337"}/api/perfil/me`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(formData),
            });

            if (!res.ok) throw new Error("Error al actualizar");
            const updatedUser = await res.json();

            login(token!, updatedUser);
            setMsg("¡Datos guardados correctamente!");
        } catch (error) {
            setMsg("Hubo un error al guardar los datos.");
        } finally {
            setSaving(false);
        }
    };

    if (loading || !user) return null;

    return (
        <div className="min-h-screen bg-gray-50 pb-12">
            <div className="w-full h-48 md:h-64 relative mb-8">
                <img src="/banner-perfil.jpg" alt="Banner" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                    <h2 className="text-white text-3xl md:text-4xl font-bold px-4 text-center">Tu ritual, tu momento.</h2>
                </div>
            </div>

            <div className="max-w-5xl mx-auto px-6">
                <div className="flex gap-6 border-b border-gray-200 mb-8">
                    <button onClick={() => setTab("compras")} className={`pb-3 text-sm font-bold ${tab === "compras" ? "border-b-2 border-[#2F4A2D] text-[#2F4A2D]" : "text-gray-400"}`}>MIS COMPRAS</button>
                    <button onClick={() => setTab("datos")} className={`pb-3 text-sm font-bold ${tab === "datos" ? "border-b-2 border-[#2F4A2D] text-[#2F4A2D]" : "text-gray-400"}`}>MIS DATOS</button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                    <div className="md:col-span-2">
                        {tab === "compras" ? (
                            loadingOrders ? <p>Cargando...</p> :
                                orders.length === 0 ? <p className="text-center py-10 text-gray-500">Sin compras recientes.</p> :
                                    orders.map(o => (
                                        <div key={o.id} className="bg-white p-5 mb-2 rounded border shadow-sm flex justify-between">
                                            <span className="font-bold text-[#2F4A2D]">Orden #{o.id}</span>
                                            <span className="font-bold">${Number(o.total).toLocaleString("es-AR")}</span>
                                        </div>
                                    ))
                        ) : (
                            <form onSubmit={handleSave} className="space-y-6">

                                {/* 1. INFORMACIÓN PERSONAL (Facturación) */}
                                <div className="bg-white p-6 rounded-xl border shadow-sm">
                                    <div className="flex items-center gap-2 mb-4">
                                        <h3 className="text-lg font-bold text-[#2F4A2D]">Información Personal</h3>
                                        <span className="text-gray-400 text-sm">👤 (Datos de Facturación)</span>
                                    </div>

                                    {/* Nombre y Contacto */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                        <div>
                                            <label className="block text-xs font-bold text-gray-500 mb-1">NOMBRE</label>
                                            <input type="text" value={formData.nombre} onChange={(e) => setFormData({ ...formData, nombre: e.target.value })} className="w-full border rounded-lg px-4 py-2" placeholder="Ej: Juan" />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-gray-500 mb-1">APELLIDO</label>
                                            <input type="text" value={formData.apellido} onChange={(e) => setFormData({ ...formData, apellido: e.target.value })} className="w-full border rounded-lg px-4 py-2" placeholder="Ej: Perez" />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-gray-500 mb-1">EMAIL</label>
                                            <input type="text" value={formData.email} disabled className="w-full border rounded-lg px-4 py-2 bg-gray-100 text-gray-500" />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-gray-500 mb-1">TELÉFONO</label>
                                            <input type="text" value={formData.telefono} onChange={(e) => setFormData({ ...formData, telefono: e.target.value })} className="w-full border rounded-lg px-4 py-2" />
                                        </div>
                                    </div>

                                    {/* Dirección Personal */}
                                    <div className="border-t pt-4">
                                        <p className="text-xs font-bold text-gray-500 mb-2 uppercase">Domicilio de Facturación</p>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <input type="text" value={formData.direccion_facturacion} onChange={(e) => setFormData({ ...formData, direccion_facturacion: e.target.value })} className="w-full border rounded-lg px-4 py-2" placeholder="Calle" />
                                            <input type="text" value={formData.numero_facturacion} onChange={(e) => setFormData({ ...formData, numero_facturacion: e.target.value })} className="w-full border rounded-lg px-4 py-2" placeholder="Altura" />
                                            <input type="text" value={formData.ciudad_facturacion} onChange={(e) => setFormData({ ...formData, ciudad_facturacion: e.target.value })} className="w-full border rounded-lg px-4 py-2" placeholder="Ciudad" />
                                            <input type="text" value={formData.cp_facturacion} onChange={(e) => setFormData({ ...formData, cp_facturacion: e.target.value })} className="w-full border rounded-lg px-4 py-2" placeholder="CP" />
                                        </div>
                                    </div>
                                </div>

                                {/* 2. DATOS DE ENVÍO */}
                                <div className="bg-white p-6 rounded-xl border shadow-sm">
                                    <div className="flex items-center gap-2 mb-4">
                                        <h3 className="text-lg font-bold text-[#2F4A2D]">Datos de Envío</h3>
                                        <span className="text-gray-400 text-sm">🚚 (Dónde recibes tus paquetes)</span>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="md:col-span-1">
                                            <label className="block text-xs font-bold text-gray-500 mb-1">CALLE</label>
                                            <input type="text" value={formData.direccion} onChange={(e) => setFormData({ ...formData, direccion: e.target.value })} className="w-full border rounded-lg px-4 py-2" placeholder="Calle de entrega" />
                                        </div>
                                        <div className="md:col-span-1">
                                            <label className="block text-xs font-bold text-gray-500 mb-1">ALTURA</label>
                                            <input type="text" value={formData.numero} onChange={(e) => setFormData({ ...formData, numero: e.target.value })} className="w-full border rounded-lg px-4 py-2" placeholder="1234" />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-gray-500 mb-1">CIUDAD</label>
                                            <input type="text" value={formData.ciudad} onChange={(e) => setFormData({ ...formData, ciudad: e.target.value })} className="w-full border rounded-lg px-4 py-2" />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-gray-500 mb-1">PROVINCIA</label>
                                            <input type="text" value={formData.provincia} onChange={(e) => setFormData({ ...formData, provincia: e.target.value })} className="w-full border rounded-lg px-4 py-2" />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-gray-500 mb-1">CÓDIGO POSTAL</label>
                                            <input type="text" value={formData.codigoPostal} onChange={(e) => setFormData({ ...formData, codigoPostal: e.target.value })} className="w-full border rounded-lg px-4 py-2" />
                                        </div>
                                    </div>
                                </div>

                                {msg && <p className={`text-center font-medium ${msg.includes("error") ? "text-red-600" : "text-green-600"}`}>{msg}</p>}

                                <button type="submit" disabled={saving} className="w-full bg-[#2F4A2D] text-white font-bold py-3 rounded-lg hover:bg-[#1e331c] transition-colors">
                                    {saving ? "Guardando..." : "Guardar Todos los Cambios"}
                                </button>
                            </form>
                        )}
                    </div>

                    <div className="md:col-span-1">
                        <div className="bg-[#F8F6F1] p-6 rounded-xl border border-[#E6E2DB]">
                            <h3 className="font-bold text-[#2F4A2D]">{user.nombre ? `${user.nombre} ${user.apellido}` : user.username}</h3>
                            <p className="text-sm text-gray-500 mb-4">{user.email}</p>
                            <button onClick={logout} className="text-red-600 text-sm font-medium hover:underline">Cerrar Sesión</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}