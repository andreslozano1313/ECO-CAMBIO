const express = require('express');
const router = express.Router();
const { crearProducto, getProductos, eliminarProducto, getProducto } = require('../controllers/productoController'); 
const { protect } = require('../middleware/authMiddleware');
const upload = require('../config/multerConfig'); 
const { crearComentario, getComentariosProducto } = require('../controllers/comentarioController');

// 1. RUTA BASE (GET ALL / POST)
router.route('/')
    .get(protect, getProductos) 
    .post(
        protect, 
        upload.single('foto'),
        crearProducto
    );

// 2. RUTA DE DETALLE Y GESTIÓN (ID)
router.route('/:id')
    .get(protect, getProducto) // GET /api/productos/:id (Detalle)
    .delete(protect, eliminarProducto); // DELETE /api/productos/:id (Eliminar)


// 3. RUTAS DE COMENTARIOS 
// Estas rutas tienen una sintaxis ligeramente diferente, pero funcionan bien.
router.route('/:id/comentarios')
    .post(protect, crearComentario) 
    .get(protect, getComentariosProducto); 


module.exports = router;