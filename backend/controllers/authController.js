const asyncHandler = require('express-async-handler'); //esta libreria maneja las promesas de forma limpia
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Usuario = require('../models/Usuario');

const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '30d', // hace que el token expira en 30 días
    });
};

// @desc    Registrar un nuevo usuario
// @route   POST /api/auth/register
// @access  Público
const registerUser = asyncHandler(async (req, res) => {
    const { nombres, email, contraseña } = req.body;

    if (!nombres || !email || !contraseña) {
        res.status(400);
        throw new Error('Por favor, completa todos los campos.');
    }

    // Verificar si el usuario ya existe
    const usuarioExiste = await Usuario.findOne({ email });

    if (usuarioExiste) {
        res.status(400);
        throw new Error('El usuario con ese email ya está registrado.');
    }

    // Hashear la contraseña
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(contraseña, salt);

    // Crear el usuario en la base de datos
    const usuario = await Usuario.create({
        nombres,
        email,
        contraseña: hashedPassword,
    });

    if (usuario) {
        res.status(201).json({
            _id: usuario.id,
            nombres: usuario.nombres,
            email: usuario.email,
            token: generateToken(usuario._id),
            // La puntuacionTotal se crea automáticamente en 0 por el Schema
        });
    } else {
        res.status(400);
        throw new Error('Datos de usuario no válidos.');
    }
});

// @desc Autenticar un usuario (Login)
// @route   POST /api/auth/login
// @access  Público
const loginUser = asyncHandler(async (req, res) => {
    const { email, contraseña } = req.body;

    if (!email || !contraseña) {
        res.status(400);
        throw new Error('Por favor, ingresa email y contraseña.');
    }

    // Buscar el usuario por email
    const usuario = await Usuario.findOne({ email });

    // Comparar la contraseña ingresada con el hash de la BD
    if (usuario && (await bcrypt.compare(contraseña, usuario.contraseña))) {
        res.json({
            _id: usuario.id,
            nombres: usuario.nombres,
            email: usuario.email,
            token: generateToken(usuario._id),
        });
    } else {
        res.status(401); // Unauthorized
        throw new Error('Credenciales inválidas.');
    }
});


module.exports = {
    registerUser,
    loginUser,
};