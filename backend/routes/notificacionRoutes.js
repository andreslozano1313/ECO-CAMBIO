const express = require('express');
const router = express.Router();
const asyncHandler = require('express-async-handler');
const { protect } = require('../middleware/authMiddleware');
const Notificacion = require('../models/Notificacion');

// @desc    Obtener notificaciones del usuario autenticado
// @route   GET /api/notificaciones
// @access  Privado
router.get('/', protect, asyncHandler(async (req, res) => {
    const notificaciones = await Notificacion.find({ usuarioDestino: req.usuario.id, leido: false })
        .populate('emisor', 'nombres') // Para saber quién envió la notificación
        .sort({ createdAt: -1 });
    
    res.status(200).json(notificaciones);
}));

// @desc    Marcar una notificación como leída
// @route   PUT /api/notificaciones/:id/leida
// @access  Privado
router.put('/:id/leida', protect, asyncHandler(async (req, res) => {
    await Notificacion.findByIdAndUpdate(
        req.params.id, 
        { leido: true }, 
        { new: true }
    );
    res.status(200).json({ message: 'Notificación marcada como leída.' });
}));

module.exports = router;