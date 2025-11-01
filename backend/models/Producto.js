const mongoose = require('mongoose');

const productoSchema = mongoose.Schema(
    {
        ID_Usuario: { // Referencia al vendedor/donante (FK)
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: 'Usuario',
        },
        Nombre_Producto: {
            type: String,
            required: [true, 'El nombre del producto es obligatorio.'],
        },
        Foto_Producto: {
            type: String, // Almacena la URL de la imagen
            default: null,
        },
        Categoria: {
            type: String,
            required: true,
            // Podrías usar un array de strings o un enum para categorías fijas
            enum: ['Electrodoméstico', 'Mueble', 'Ropa', 'Electrónica', 'Otros'], 
        },
        Descripcion: {
            type: String,
            required: [true, 'La descripción es obligatoria.'],
        },
        Estado: {
            type: String,
            enum: ['Nuevo', 'Usado', 'Para Reutilizar'],
            default: 'Usado',
        },
        Tipo: {
            type: String,
            enum: ['Venta', 'Donación'],
            required: true,
        },
        Precio: {
            type: Number,
            required: function() { return this.Tipo === 'Venta'; }, // Requerido solo si es Venta
            default: 0,
        },
        Cantidad_Disponible: {
            type: Number,
            default: 1,
        },
        Ubicacion: { // Ciudad, Barrio, etc.
            type: String,
            required: true,
        },
    },
    {
        timestamps: true, // Incluye Fecha_Publicación/createdAt
    }
);

module.exports = mongoose.model('Producto', productoSchema);