import { fetchFromStrapi } from "@/lib/api";
import ProductosView from "./ProductosView";

export default async function CatalogoPage() {
    // AGREGAMOS populate[variantes]=true para poder pintar los circulitos
    const res = await fetchFromStrapi(
        "/productos?populate[imagen]=true&populate[categoria]=true&populate[variantes]=true"
    );

    const productos = res.data ?? [];

    return <ProductosView productos={productos} />;
}