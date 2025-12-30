export interface Opinion {
  id: number;
  Texto: string;
  Puntuacion: number;
  estado: 'pendiente' | 'aprobada' | 'rechazada';
  createdAt: string;
  usuario?: {
    data: {
      attributes: {
        username: string;
      }
    }
  };
}

// ... Resto de la interfaz Producto igual ...
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

  // NUEVOS CAMPOS PARA VISUALIZACIÓN
  codigo_color?: string; // Hexadecimal (ej: #000000)
  indice_imagen?: number; // Qué posición de foto usar (0, 1, 2...)
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
  opinions?: Opinion[];

  categoria?: any;
  destacado?: boolean;
}