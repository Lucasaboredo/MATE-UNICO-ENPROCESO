// src/types/product.ts

export interface Imagen {
  id: number;
  url: string;
  width?: number;
  height?: number;
}

export interface Variante {
  id: number;
  nombre: string;
  color?: string;
  stock?: number;
  precio?: number;
}

export interface Opinion {
  id: number;
  autor: string;
  texto: string;
  puntuacion: number;
  createdAt: string;
}

export interface Producto {
  id: number;
  documentId: string;
  nombre: string;
  descripcion: string;
  precioBase: number;
  material: string;
  activo: boolean;
  slug: string;

  variantes: Variante[];
  imagen: Imagen[];

  // AQUÍ ESTABA EL PROBLEMA:
  // Antes decía "opiniones", ahora lo cambiamos a "opinions"
  opinions?: Opinion[];

  categoria?: any;
  destacado?: boolean;
}