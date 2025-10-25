const asyncHandler = require('express-async-handler');
const Transaccion = require('../models/Transaccion');
const Producto = require('../models/Producto');
const Usuario = require('../models/Usuario');

// @desc    Simular la realización de un pago o donación
// @route   POST /api/transacciones/simular
// @access  Privado (requiere estar logueado como Comprador/Donante)
const simularPago = asyncHandler(async (req, res) => {
    const { productoId, cantidad, metodoPago } = req.body;
    const compradorId = req.usuario.id; // Usuario autenticado

    if (!productoId || !cantidad) {
        res.status(400);
        throw new Error('Producto y cantidad son obligatorios para la transacción.');
    }

    const producto = await Producto.findById(productoId);
    if (!producto) {
        res.status(404);
        throw new Error('Producto no encontrado.');
    }

    // El monto total a cobrar
    const montoTotal = producto.precio ? producto.precio * cantidad : 0;
    const vendedorId = producto.ID_Usuario; // Asumiendo que guardaste el FK ID_Usuario en Producto

    // --- 1. SIMULACIÓN DE LA PASARELA DE PAGO (Lógica de API Externa) ---
    const pagoExitoso = Math.random() < 0.95; // Simula un 95% de éxito

    let nuevoEstado = 'Pendiente';
    if (pagoExitoso) {
        nuevoEstado = 'Completada';
    } else {
        nuevoEstado = 'Fallida';
    }
    // -------------------------------------------------------------------

    // 2. Registrar la transacción en la BD
    const transaccion = await Transaccion.create({
        producto: productoId,
        comprador: compradorId,
        vendedor: vendedorId,
        monto: montoTotal,
        tipoTransaccion: producto.Tipo === 'Venta' ? 'Compra' : 'Donación',
        metodoPago: metodoPago || 'Simulado',
        estado: nuevoEstado,
    });

    // 3. Lógica de Stock/Notificación
    if (nuevoEstado === 'Completada') {
        // En una app real, aquí restarías del Inventario y notificarías al Vendedor.
    }

    if (nuevoEstado === 'Completada') {
        res.status(201).json({
            message: `Transacción de ${transaccion.tipoTransaccion} completada con éxito.`,
            transaccion: transaccion,
            simulacion: 'Pago Aprobado (Simulación)'
        });
    } else {
         // Código 402 Payment Required si la simulación falla
        res.status(402).json({
            message: 'La simulación de pago ha fallado. Intente con otro método.',
            transaccion: transaccion,
            simulacion: 'Pago Rechazado (Simulación)'
        });
    }
});

module.exports = {
    simularPago,
};