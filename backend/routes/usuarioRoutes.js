const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { getPerfil, updatePerfil } = require('../controllers/usuarioController'); 

// Consolidar GET y PUT
router.route('/perfil')
    .get(protect, getPerfil) // GET para obtener datos de edición
    .put(protect, updatePerfil); // PUT para guardar cambios

module.exports = router;