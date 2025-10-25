const mongoose = require('mongoose');

const comentarioSchema = mongoose.Schema(
    {
        publicacion: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: 'Publicacion', 
        },
        autor: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: 'Usuario', 
        },
        texto: {
            type: String,
            required: [true, 'El comentario no puede estar vacío.'],
        },
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model('Comentario', comentarioSchema);