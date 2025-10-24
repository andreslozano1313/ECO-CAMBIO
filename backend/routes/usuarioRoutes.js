const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { getPerfil } = require('../controllers/usuarioController');

// @desc    Obtener datos del usuario conectado (Perfil)
// @route   GET /api/usuarios/perfil
// @access  Privado (requiere token)
router.get('/perfil', protect, getPerfil);

module.exports = router;