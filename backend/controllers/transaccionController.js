const asyncHandler = require('express-async-handler');
const Transaccion = require('../models/Transaccion');
const Producto = require('../models/Producto');
const Notificacion = require('../models/Notificacion'); 

// @desc    Simular la realización de un pago o donación
// @route   POST /api/transacciones/simular
// @access  Privado (requiere estar logueado como Comprador/Donante)
const simularPago = asyncHandler(async (req, res) => {
    const { productoId, cantidad, metodoPago } = req.body;
    const compradorId = req.usuario.id; 

    if (!productoId || !cantidad || cantidad <= 0) { 
        res.status(400);
        throw new Error('El ID del producto y la cantidad válida son obligatorios para la transacción.');
    }

    const producto = await Producto.findById(productoId);
    if (!producto) {
        res.status(404);
        throw new Error('Producto no encontrado.');
    }
    
    // --- VALIDACIÓN DE STOCK ---
    if (producto.Cantidad_Disponible < cantidad) {
        res.status(400);
        throw new Error(`Stock insuficiente. Solo quedan ${producto.Cantidad_Disponible} unidades.`);
    }

    // El monto total a cobrar
    const montoTotal = producto.Precio ? producto.Precio * cantidad : 0;

    const vendedorId = producto.ID_Usuario; 

    
    const pagoExitoso = Math.random() < 0.95; 

    let nuevoEstado = 'Pendiente';
    if (pagoExitoso) {
        nuevoEstado = 'Completada';
    } else {
        nuevoEstado = 'Fallida';
    }
    

    // Registrar la transacción en la BD
    const transaccion = await Transaccion.create({
        producto: productoId,
        comprador: compradorId, 
        vendedor: vendedorId,   
        monto: montoTotal,
        tipoTransaccion: producto.Tipo === 'Venta' ? 'Compra' : 'Donación',
        metodoPago: metodoPago || 'Simulado',
        estado: nuevoEstado,
        
    });

    
    if (nuevoEstado === 'Completada') {
        
        await Producto.findByIdAndUpdate(
            productoId, 
            { $inc: { Cantidad_Disponible: -cantidad } }, 
            { new: true }
        );

        // NOTIFICACIÓN AL VENDEDOR
        await Notificacion.create({
            usuarioDestino: vendedorId,
            emisor: compradorId,
            tipo: producto.Tipo === 'Venta' ? 'TRANSACCION_COMPRA' : 'TRANSACCION_DONACION',
            mensaje: `¡Tienes una nueva ${producto.Tipo} de ${producto.Nombre_Producto} por ${producto.Tipo === 'Venta' ? `$${montoTotal.toFixed(2)}` : 'Donación'}!`,
            referenciaId: transaccion._id,
        });
    }

    if (nuevoEstado === 'Completada') {
        res.status(201).json({
            message: `Transacción de ${transaccion.tipoTransaccion} completada con éxito.`,
            transaccion: transaccion,
            simulacion: 'Pago Aprobado (Simulación)'
        });
    } else {
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