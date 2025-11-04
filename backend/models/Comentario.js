const mongoose = require('mongoose');

const comentarioSchema = mongoose.Schema(
    {
        
        producto: { 
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: 'Producto', 
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