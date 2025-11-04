// backend/controllers/comentarioController.js (CORRECCIÓN CRÍTICA)

const asyncHandler = require('express-async-handler');
const Comentario = require('../models/Comentario');
const Producto = require('../models/Producto'); // <-- CAMBIO DE PUBLICACION A PRODUCTO
const Notificacion = require('../models/Notificacion'); 
const Usuario = require('../models/Usuario'); 

// @desc    Crear un nuevo comentario para un producto
// @route   POST /api/productos/:id/comentarios  // <--- NOTA: CAMBIAREMOS LA RUTA DESPUÉS
// @access  Privado
const crearComentario = asyncHandler(async (req, res) => {
    const { texto } = req.body;
    const productoId = req.params.id; // <-- AHORA ESPERAMOS UN ID DE PRODUCTO
    
    // 1. Verificar si el PRODUCTO existe
    const productoExiste = await Producto.findById(productoId) // <-- USAR MODELO PRODUCTO
        .populate('ID_Usuario', 'nombres'); // <-- Poblar el autor del producto
    
    if (!productoExiste) {
        res.status(404);
        throw new Error('Producto no encontrado.'); // <-- MENSAJE DE ERROR CORREGIDO
    }

    // 2. Crear el comentario
    const comentario = await Comentario.create({
        producto: productoId, // <-- Usar 'producto' como FK
        autor: req.usuario.id, 
        texto,
    });
    
    // 3. LÓGICA DE NOTIFICACIÓN (Asegurarse de usar productoExiste)
    const usuarioEmisor = await Usuario.findById(req.usuario.id).select('nombres');

    if (productoExiste.ID_Usuario.id.toString() !== req.usuario.id) {
        await Notificacion.create({
            usuarioDestino: productoExiste.ID_Usuario._id, // Autor del PRODUCTO
            emisor: req.usuario.id,
            tipo: 'COMENTARIO',
            mensaje: `${usuarioEmisor.nombres} ha comentado en tu artículo: "${productoExiste.Nombre_Producto}"`,
            referenciaId: productoId,
        });
    }

    res.status(201).json(comentario);
});

// @desc    Obtener todos los comentarios de un producto
// @route   GET /api/productos/:id/comentarios
// @access  Privado
const getComentariosProducto = asyncHandler(async (req, res) => {
    const comentarios = await Comentario.find({ producto: req.params.id }) // <-- USAR 'producto'
        .populate('autor', 'nombres fotoPerfil') 
        .sort({ createdAt: 1 }); 

    res.status(200).json(comentarios);
});

module.exports = {
    crearComentario,
    getComentariosProducto, // <-- Renombrar a Producto
};