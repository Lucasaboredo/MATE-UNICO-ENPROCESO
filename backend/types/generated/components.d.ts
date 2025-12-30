import type { Schema, Struct } from '@strapi/strapi';

export interface FaqSection extends Struct.ComponentSchema {
  collectionName: 'components_faq_sections';
  info: {
    displayName: 'section';
  };
  attributes: {
    descripcion: Schema.Attribute.Blocks;
    icono: Schema.Attribute.Media<'images' | 'files' | 'videos' | 'audios'>;
    titulo: Schema.Attribute.String;
  };
}

export interface InventarioVariantes extends Struct.ComponentSchema {
  collectionName: 'components_inventario_variantes';
  info: {
    displayName: 'Variantes';
  };
  attributes: {
    codigo_color: Schema.Attribute.String;
    indice_imagen: Schema.Attribute.Integer;
    nombre: Schema.Attribute.String & Schema.Attribute.Required;
    precio: Schema.Attribute.Decimal;
    stock: Schema.Attribute.Integer &
      Schema.Attribute.Required &
      Schema.Attribute.DefaultTo<0>;
  };
}

declare module '@strapi/strapi' {
  export module Public {
    export interface ComponentSchemas {
      'faq.section': FaqSection;
      'inventario.variantes': InventarioVariantes;
    }
  }
}
