const asyncHandler = require('express-async-handler');
const Transaccion = require('../models/Transaccion');
const Producto = require('../models/Producto');
const Notificacion = require('../models/Notificacion'); // <-- IMPORTAR NOTIFICACIÓN
// const Usuario = require('../models/Usuario'); // No es necesario si no se usa directamente aquí

// @desc    Simular la realización de un pago o donación
// @route   POST /api/transacciones/simular
// @access  Privado (requiere estar logueado como Comprador/Donante)
const simularPago = asyncHandler(async (req, res) => {
    const { productoId, cantidad, metodoPago } = req.body;
    const compradorId = req.usuario.id; // Comprador/Donante (Usuario autenticado)

    if (!productoId || !cantidad || cantidad <= 0) { // Añadir validación de cantidad positiva
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

    // El monto total a cobrar (Asumiendo que precio es por unidad)
    const montoTotal = producto.Precio ? producto.Precio * cantidad : 0;
    // VENDEDOR: Se obtiene del campo ID_Usuario del producto (¡Trazabilidad OK!)
    const vendedorId = producto.ID_Usuario; 

    // --- 1. SIMULACIÓN DE LA PASARELA DE PAGO ---
    const pagoExitoso = Math.random() < 0.95; 

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
        comprador: compradorId, // <-- TRAZABILIDAD: OK
        vendedor: vendedorId,   // <-- TRAZABILIDAD: OK
        monto: montoTotal,
        tipoTransaccion: producto.Tipo === 'Venta' ? 'Compra' : 'Donación',
        metodoPago: metodoPago || 'Simulado',
        estado: nuevoEstado,
        // Cantidad se debe agregar al modelo de Transacción para ser completa
    });

    // 3. Lógica de Stock y Notificación (SOLO si fue completada)
    if (nuevoEstado === 'Completada') {
        // A. RESTAR DEL INVENTARIO (Lógica de Stock)
        await Producto.findByIdAndUpdate(
            productoId, 
            { $inc: { Cantidad_Disponible: -cantidad } }, // Reduce la cantidad por la cantidad vendida
            { new: true }
        );

        // B. NOTIFICACIÓN AL VENDEDOR
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