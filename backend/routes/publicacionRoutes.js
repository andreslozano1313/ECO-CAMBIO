// backend/routes/publicacionRoutes.js (CORRECCIÓN DE IMPORTACIÓN)

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

// --- CORRECCIÓN AQUÍ: USAR EL NOMBRE CORRECTO EXPORTADO ---
// Asumimos que el comentarioController exporta { crearComentario, getComentariosProducto }
const { crearComentario, getComentariosProducto } = require('../controllers/comentarioController');

// ... (Resto de las rutas) ...

router.route('/:id/comentarios')
    .post(protect, crearComentario) 
    .get(protect, getComentariosProducto); // <-- USAR EL NOMBRE CORRECTO: getComentariosProducto

module.exports = router;