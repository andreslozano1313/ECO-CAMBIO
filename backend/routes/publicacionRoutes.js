
const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const upload = require('../config/multerConfig'); 

const { 
    crearPublicacion, 
    getPublicaciones, 
    eliminarPublicacion,
    actualizarPublicacion
} = require('../controllers/publicacionController'); 


// Asumimos que el comentarioController exporta { crearComentario, getComentariosProducto }
const { crearComentario, getComentariosProducto } = require('../controllers/comentarioController');

router.route('/:id/comentarios')
    .post(protect, crearComentario) 
    .get(protect, getComentariosProducto); 

module.exports = router;