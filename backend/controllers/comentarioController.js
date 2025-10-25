const asyncHandler = require('express-async-handler');
const Comentario = require('../models/Comentario');
const Publicacion = require('../models/Publicacion');

// @desc    Crear un nuevo comentario para una publicación
// @route   POST /api/publicaciones/:id/comentarios
// @access  Privado
const crearComentario = asyncHandler(async (req, res) => {
    const { texto } = req.body;
    const publicacionId = req.params.id;
    
    if (!texto) {
        res.status(400);
        throw new Error('El texto del comentario es obligatorio.');
    }

    const publicacionExiste = await Publicacion.findById(publicacionId);
    if (!publicacionExiste) {
        res.status(404);
        throw new Error('Publicación no encontrada.');
    }

    const comentario = await Comentario.create({
        publicacion: publicacionId,
        autor: req.usuario.id, 
        texto,
    });

    res.status(201).json(comentario);
});

// @desc    Obtener todos los comentarios de una publicación
// @route   GET /api/publicaciones/:id/comentarios
// @access  Privado
const getComentariosPublicacion = asyncHandler(async (req, res) => {
    const comentarios = await Comentario.find({ publicacion: req.params.id })
        .populate('autor', 'nombres fotoPerfil') // Muestra el nombre del autor
        .sort({ createdAt: 1 }); // Ordenamos del más antiguo al más nuevo

    res.status(200).json(comentarios);
});

module.exports = {
    crearComentario,
    getComentariosPublicacion,
};