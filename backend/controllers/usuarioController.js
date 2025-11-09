const asyncHandler = require('express-async-handler');
const Usuario = require('../models/Usuario');
const bcrypt = require('bcryptjs'); // Necesario para hashear la nueva contraseña

// @desc    Obtener datos del usuario conectado (Perfil)
// @route   GET /api/usuarios/perfil
// @access  Privado
// (Esta función ya existe, pero la incluimos para referencia)
const getPerfil = asyncHandler(async (req, res) => {
    const usuario = await Usuario.findById(req.usuario.id).select('-contraseña');
    if (!usuario) {
        res.status(404);
        throw new Error('Usuario no encontrado.');
    }
    // Devolvemos solo los datos que se pueden actualizar en el frontend
    res.status(200).json({
        id: usuario._id,
        nombres: usuario.nombres,
        email: usuario.email,
        // No devolver la puntuación si no es necesaria en la edición
    });
});

// @desc    Actualizar datos del usuario
// @route   PUT /api/usuarios/perfil
// @access  Privado
const updatePerfil = asyncHandler(async (req, res) => {
    const { nombres, email, contraseña } = req.body;
    const usuarioId = req.usuario.id;

    const usuario = await Usuario.findById(usuarioId);

    if (!usuario) {
        res.status(404);
        throw new Error('Usuario no encontrado.');
    }

    // 1. Validar Email Único (si el email cambia)
    if (email && email !== usuario.email) {
        const emailExiste = await Usuario.findOne({ email });
        if (emailExiste) {
            res.status(400);
            throw new Error('Este email ya está registrado por otro usuario.');
        }
    }

    // 2. Actualizar la Contraseña si se proporciona
    let hashedPassword = usuario.contraseña;
    if (contraseña && contraseña.length > 0) {
        const salt = await bcrypt.genSalt(10);
        hashedPassword = await bcrypt.hash(contraseña, salt);
    }
    
    // 3. Actualizar y guardar
    usuario.nombres = nombres || usuario.nombres;
    usuario.email = email || usuario.email;
    usuario.contraseña = hashedPassword;
    
    const usuarioActualizado = await usuario.save();

    res.json({
        id: usuarioActualizado._id,
        nombres: usuarioActualizado.nombres,
        email: usuarioActualizado.email,
        message: 'Perfil actualizado con éxito.'
    });
});

module.exports = {
    getPerfil,
    updatePerfil, 
};