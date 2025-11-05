const mongoose = require('mongoose');

const mensajeSchema = mongoose.Schema(
    {
        producto: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: 'Producto',
        },
        emisor: { // Usuario que quiere comprar/donar (Comprador)
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: 'Usuario',
        },
        receptor: { // Usuario que publicó el producto (Vendedor)
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: 'Usuario',
        },
        contenido: { // El mensaje interno
            type: String,
            required: true,
        },
        leido: {
            type: Boolean,
            default: false,
        },
        tipoMensaje: { // Para distinguir la acción
            type: String,
            enum: ['INTERES_COMPRA', 'INTERES_DONACION', 'RESPUESTA_VENDEDOR'],
            default: 'INTERES_COMPRA',
        }
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model('Mensaje', mensajeSchema);