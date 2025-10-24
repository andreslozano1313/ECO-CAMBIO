const asyncHandler = require('express-async-handler');
const Usuario = require('../models/Usuario');

// @desc    Obtener datos del usuario conectado (Puntuación y Perfil)
// @route   GET /api/usuarios/perfil
// @access  Privado
const getPerfil = asyncHandler(async (req, res) => {
    
    const usuario = await Usuario.findById(req.usuario.id).select('-contraseña');
    
    if (usuario) {
        
        res.status(200).json({
            id: usuario._id,
            nombres: usuario.nombres,
            email: usuario.email,
            puntuacionTotal: usuario.puntuacionTotal 
        });
    } else {
        res.status(404);
        throw new Error('Usuario no encontrado.');
    }
});

module.exports = {
    getPerfil,
};