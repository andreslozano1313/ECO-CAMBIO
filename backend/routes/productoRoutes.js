const express = require('express');
const router = express.Router();
const { crearProducto, getProductos, eliminarProducto } = require('../controllers/productoController');
const { protect } = require ('../middleware/authMiddleware');
const upload = require('../config/multerConfig'); // Reutilizamos Multer

router.route('/')
    .get(protect, getProductos) // GET: Catálogo
    .post(
        protect, 
        upload.single('foto'), // Usamos la clave 'foto' para la imagen del producto
        crearProducto
    );

router.delete('/:id', protect, eliminarProducto);

module.exports = router;