const express = require('express');
const router = express.Router();
const asyncHandler = require('express-async-handler');
const { protect } = require('../middleware/authMiddleware');
const Notificacion = require('../models/Notificacion');

// @desc    Obtener notificaciones NO LEÍDAS del usuario autenticado
// @route   GET /api/notificaciones
// @access  Privado
router.get('/', protect, asyncHandler(async (req, res) => {
    // Esta ruta filtra por leido: false
    const notificaciones = await Notificacion.find({ usuarioDestino: req.usuario.id, leido: false }) 
        .populate('emisor', 'nombres') 
        .sort({ createdAt: -1 });
    
    res.status(200).json(notificaciones);
}));

// @desc    Marcar una notificación como leída
// @route   PUT /api/notificaciones/:id/leida
// @access  Privado
router.put('/:id/leida', protect, asyncHandler(async (req, res) => { 
    // Usamos findOneAndUpdate para asegurar que solo el usuarioDestino pueda marcarla como leída.
    const notificacion = await Notificacion.findOneAndUpdate(
        { _id: req.params.id, usuarioDestino: req.usuario.id }, 
        { leido: true }, 
        { new: true }
    );
    
    if (!notificacion) {
        res.status(404);
        throw new Error('Notificación no encontrada o no autorizada para ser marcada como leída.');
    }
    
    res.status(200).json({ message: 'Notificación marcada como leída.' });
}));

module.exports = router;