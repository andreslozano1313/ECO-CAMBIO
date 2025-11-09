const asyncHandler = require('express-async-handler'); //esta libreria maneja las promesas de forma limpia
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Usuario = require('../models/Usuario');
const nodemailer = require('nodemailer');

// --- CÓDIGO CORREGIDO: AÑADIR NOMBRES AL PAYLOAD DEL JWT ---
const generateToken = (id, nombres) => { // <-- AHORA ACEPTA NOMBRES
    return jwt.sign({ id, nombres }, process.env.JWT_SECRET, { // <-- PAYLOAD INCLUYE NOMBRES
        expiresIn: '30d', // hace que el token expira en 30 días
    });
};
// -------------------------------------------------------------

const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    secure: process.env.EMAIL_SECURE === 'true', 
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

// @desc    Registrar un nuevo usuario
// @route   POST /api/auth/register
// @access  Público
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
            // AÑADIDO: Pasamos el nombre al token
            token: generateToken(usuario._id, usuario.nombres), 
        });
    } else {
        res.status(400);
        throw new Error('Datos de usuario no válidos.');
    }
});

// @desc Autenticar un usuario (Login)
// @route   POST /api/auth/login
// @access  Público
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
            // AÑADIDO: Pasamos el nombre al token
            token: generateToken(usuario._id, usuario.nombres),
        });
    } else {
        res.status(401); // Unauthorized
        throw new Error('Credenciales inválidas.');
    }
});

// @desc    Solicitar Restablecimiento de Contraseña
// @route   POST /api/auth/forgotpassword
// @access  Público
const forgotPassword = asyncHandler(async (req, res) => {
    const { email } = req.body;

    if (!email) {
        res.status(400);
        throw new Error('Por favor, ingrese un email.');
    }

    const usuario = await Usuario.findOne({ email });

    if (!usuario) {
        // Por seguridad, no decimos si el email existe o no
        return res.status(200).json({ message: 'Si el email está registrado, recibirás un enlace de restablecimiento.' });
    }
    
    // --- LÓGICA DE SIMULACIÓN ACTIVA ---
    // NOTA: Esta simulación está configurada para ignorar el código real de Nodemailer
    console.log(`[SIMULACIÓN] Correo de restablecimiento simulado enviado a: ${usuario.email}`);
    return res.status(200).json({ 
        message: 'Email de restablecimiento enviado con éxito.' 
    });
    // --- FIN LÓGICA DE SIMULACIÓN ---
});


module.exports = {
    registerUser,
    loginUser,
    forgotPassword,
};