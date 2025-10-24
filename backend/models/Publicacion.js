const mongoose = require('mongoose');

const publicacionSchema = mongoose.Schema(
    {
        autor: {
            type: mongoose.Schema.Types.ObjectId, 
            required: true,
            ref: 'Usuario', 
        },
        texto: {
            type: String,
            required: [true, 'El texto de la acción es obligatorio.'],
        },
        urlImagen: { 
            type: String, 
            default: null,
        },
        puntosOtorgados: {
            type: Number,
            required: true,
            default: 10, 
        },
    },
    {
        timestamps: true, 
    }
);

module.exports = mongoose.model('Publicacion', publicacionSchema);