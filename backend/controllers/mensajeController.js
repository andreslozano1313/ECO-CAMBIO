const asyncHandler = require('express-async-handler');
const Mensaje = require('../models/Mensaje');
const Producto = require('../models/Producto');
const Notificacion = require('../models/Notificacion'); 
const Usuario = require('../models/Usuario'); // <-- NECESARIO para obtener nombre del emisor de la respuesta

// @desc    Obtener todos los mensajes recibidos por el usuario logueado
// @route   GET /api/mensajes/recibidos
// @access  Privado (Receptor)
const getMensajesRecibidos = asyncHandler(async (req, res) => {
    // El receptor es el usuario autenticado (req.usuario.id)
    const mensajes = await Mensaje.find({ receptor: req.usuario.id })
        .populate('emisor', 'nombres') // Quién envió el mensaje
        .populate('producto', 'Nombre_Producto Tipo') // A qué producto se refiere
        .sort({ createdAt: -1 });

    res.status(200).json(mensajes);
});

// @desc    Enviar un mensaje (puede ser Interés inicial o Respuesta)
// @route   POST /api/mensajes
// @access  Privado
const enviarMensajeInteres = asyncHandler(async (req, res) => {
    // Se acepta 'receptorId' opcionalmente para las respuestas (el comprador original)
    const { productoId, contenido, receptorId } = req.body; 
    const emisorId = req.usuario.id; // Usuario autenticado

    if (!productoId || !contenido) {
        res.status(400);
        throw new Error('Debe especificar el producto y el contenido del mensaje.');
    }

    // ----------------------------------------------------------------------
    // 1. LÓGICA DE MENSAJE INICIAL (Comprador al Vendedor)
    // ----------------------------------------------------------------------

    if (!receptorId) {
        // --- PROCESO INICIAL DE INTERÉS (Comprador -> Vendedor) ---
        const producto = await Producto.findById(productoId).populate('ID_Usuario', 'nombres');

        if (!producto) {
            res.status(404);
            throw new Error('Producto no encontrado.');
        }
        
        const finalReceptorId = producto.ID_Usuario._id; // El vendedor
        const tipo = producto.Tipo === 'Venta' ? 'INTERES_COMPRA' : 'INTERES_DONACION';

        // Crear el Mensaje Inicial
        await Mensaje.create({
            producto: productoId,
            emisor: emisorId,
            receptor: finalReceptorId,
            contenido,
            tipoMensaje: tipo,
        });
        
        // Crear Notificación para el VENDEDOR
        await Notificacion.create({
            usuarioDestino: finalReceptorId,
            emisor: emisorId,
            tipo: 'TRANSACCION', // Alerta al vendedor sobre una acción de venta/donación
            mensaje: `¡Tienes un nuevo mensaje de interés en tu artículo: ${producto.Nombre_Producto}!`,
            referenciaId: productoId,
        });

    } 
    
    // ----------------------------------------------------------------------
    // 2. LÓGICA DE RESPUESTA (Vendedor al Comprador)
    // ----------------------------------------------------------------------
    
    else { 
        // --- PROCESO DE RESPUESTA (Vendedor -> Comprador) ---
        const receptorDelMensaje = receptorId; 
        
        // Crear el mensaje de respuesta
        await Mensaje.create({
            producto: productoId,
            emisor: emisorId, // Vendedor
            receptor: receptorDelMensaje, // Comprador
            contenido,
            tipoMensaje: 'RESPUESTA_VENDEDOR',
        });
        
        // Crear Notificación para el COMPRADOR
        const emisorUsuario = await Usuario.findById(emisorId).select('nombres');
        await Notificacion.create({
            usuarioDestino: receptorDelMensaje, // Notificar al comprador
            emisor: emisorId,
            tipo: 'COMENTARIO', // Reutilizar para alerta simple de respuesta
            mensaje: `${emisorUsuario.nombres} ha respondido a tu interés en un artículo. ¡Revisa tu Bandeja!`,
            referenciaId: productoId,
        });
    }

    res.status(201).json({ message: 'Mensaje procesado con éxito.' });
});

module.exports = {
    enviarMensajeInteres,
    getMensajesRecibidos,
};