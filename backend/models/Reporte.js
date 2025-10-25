const mongoose = require('mongoose');

const reporteSchema = mongoose.Schema(
    {
        autor: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: 'Usuario',
        },
        descripcion: {
            type: String,
            required: [true, 'La descripción del problema es obligatoria.'],
        },
        ubicacion: {
            type: {
                type: String,
                enum: ['Point'], // Tipo de dato geoJSON
                default: 'Point',
            },
            coordinates: { // [longitud, latitud]
                type: [Number],
                required: true,
                index: '2dsphere', // Índice geoespacial para búsquedas eficientes
            },
        },
        urlFoto: { 
            type: String,
            default: null,
        },
        estado: {
            type: String,
            enum: ['Pendiente', 'En Revisión', 'Resuelto'],
            default: 'Pendiente',
        },
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model('Reporte', reporteSchema);