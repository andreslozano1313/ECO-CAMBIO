const mongoose = require('mongoose');

const transaccionSchema = mongoose.Schema(
    {
        producto: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: 'Producto',
        },
        comprador: { // Usuario que inicia la transacción (Comprador/Donante)
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: 'Usuario',
        },
        vendedor: { // Usuario que recibe el dinero/donación
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: 'Usuario',
        },
        monto: { // Usamos 'monto' en lugar de 'precio' en la transacción
            type: Number,
            required: true,
        },
        tipoTransaccion: {
            type: String,
            enum: ['Compra', 'Donación'],
            required: true,
        },
        metodoPago: {
            type: String,
            default: 'Simulado', // Para indicar que es una simulación
        },
        estado: {
            type: String,
            enum: ['Pendiente', 'Completada', 'Cancelada', 'Fallida'],
            default: 'Pendiente',
        },
    },
    {
        timestamps: true, // Registra Fecha_Transaccion
    }
);

module.exports = mongoose.model('Transaccion', transaccionSchema);