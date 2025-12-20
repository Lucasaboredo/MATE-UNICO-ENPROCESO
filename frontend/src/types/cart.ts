export interface CartItem {
  productId: number;
  variantId?: number;
  nombre: string;
  slug: string;
  precioUnitario: number;
  cantidad: number;
  imagenUrl: string;
  stock: number;
}
