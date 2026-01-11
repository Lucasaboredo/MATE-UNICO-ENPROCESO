export interface Imagen {
  id: number;
  url: string;
}

export interface Variante {
  id: number;
  nombre: string;
  precio?: number; // Precio específico de la variante (opcional)
  stock: number;
  codigo_color?: string; // Hex del color (ej: #000000)
  indice_imagen?: number; // Qué foto mostrar al seleccionar
}

export interface Opinion {
  id: number;
  Puntuacion: number;
  Texto: string;
  createdAt: string;
}

export interface Categoria {
  id: number;
  nombre: string;
  slug: string;
}

export interface Producto {
  id: number;
  documentId: string;
  nombre: string;
  descripcion: string;
  precioBase: number;
  activo: boolean;
  material?: string;
  slug: string;
  destacado: boolean;
  imagen?: Imagen[];
  variantes?: Variante[];
  categoria?: Categoria;
  opinions?: Opinion[];
  // ✨ NUEVO CAMPO
  permite_grabado: boolean; 
}