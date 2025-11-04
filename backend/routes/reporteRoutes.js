const express = require('express');
const router = express.Router();
const { crearReporte, getReportes, eliminarReporte } = require('../controllers/reporteController');
const { protect } = require('../middleware/authMiddleware');
const upload = require('../config/multerConfig'); 

// 1. RUTA BASE (sin ID)
router.route('/')
    .post(
        protect, 
        upload.single('foto'), 
        crearReporte
    )
    .get(protect, getReportes);

router.route('/:id')
    .delete(protect, eliminarReporte); 

module.exports = router;