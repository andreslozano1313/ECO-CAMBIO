const mongoose = require('mongoose');

const notificacionSchema = mongoose.Schema({
    usuarioDestino: { // El usuario que debe ver la notificación (Autor del post)
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'Usuario',
    },
    emisor: { // El usuario que hizo la acción (el que comentó)
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Usuario',
    },
    tipo: {
        type: String,
        enum: ['COMENTARIO', 'TRANSACCION', 'REPORTE_CERRADO'],
        required: true,
    },
    mensaje: {
        type: String,
        required: true,
    },
    leido: {
        type: Boolean,
        default: false,
    },
    referenciaId: mongoose.Schema.Types.ObjectId, // ID del producto/publicación/transacción
}, {
    timestamps: true,
});

module.exports = mongoose.model('Notificacion', notificacionSchema);