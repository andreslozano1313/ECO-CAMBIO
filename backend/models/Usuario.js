const mongoose = require('mongoose');

const usuarioSchema = mongoose.Schema(
    {
        nombres: {
            type: String,
            required: [true, 'Por favor agrega tu nombre'],
        },
        email: {
            type: String,
            required: [true, 'Por favor agrega un email'],
            unique: true, 
        },
        contraseña: { 
            type: String,
            required: [true, 'Por favor agrega una contraseña'],
        },
        puntuacionTotal: { 
            type: Number,
            default: 0,
        },
        
        rol: { 
            type: String, 
            enum: ['Vendedor', 'Comprador', 'Donante'], 
            default: 'Comprador' 
        },
        fotoPerfil: {
            type: String,
            default: null,
        },
    },
    {
        timestamps: true, 
    }
);

module.exports = mongoose.model('Usuario', usuarioSchema);