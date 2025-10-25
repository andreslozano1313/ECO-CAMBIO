const express = require('express');
const router = express.Router();
const { crearReporte, getReportes } = require('../controllers/reporteController');
const { protect } = require('../middleware/authMiddleware');
const upload = require('../config/multerConfig'); // Middleware para subir archivos

router.route('/')
    .post(
        protect, 
        upload.single('foto'), // Puede incluir una foto del problema
        crearReporte
    )
    .get(protect, getReportes);

module.exports = router;