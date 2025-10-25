const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const upload = require('../config/multerConfig'); 
const { crearPublicacion, 
        getPublicaciones, 
        eliminarPublicacion,
        actualizarPublicacion
} = require('../controllers/publicacionController');
const { crearComentario, getComentariosPublicacion } = require('../controllers/comentarioController');

// La ruta usa 2 middlewares: 
// 1. protect: Para verificar que el usuario está logueado.
// 2. upload.single('foto'): Para manejar la subida de un solo archivo con la key 'foto'.

router.post(
    '/', 
    protect, 
    upload.single('foto'), 
    crearPublicacion
);

router.get('/', protect, getPublicaciones);

router.delete('/:id', protect, eliminarPublicacion);

router.put(
    '/:id', 
    protect, 
    upload.single('foto'),
    actualizarPublicacion
);

router.route('/:id/comentarios')
    .post(protect, crearComentario) // POST para crear comentario
    .get(protect, getComentariosPublicacion); // GET para obtener todos los comentarios

module.exports = router;