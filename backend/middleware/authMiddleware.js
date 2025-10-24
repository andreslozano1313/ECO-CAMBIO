const jwt = require('jsonwebtoken');
const asyncHandler = require('express-async-handler');
const Usuario = require('../models/Usuario');

const protect = asyncHandler(async (req, res, next) => {
    let token;

    // 1. Verificar si la petición tiene el token en la cabecera (Header)
    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith('Bearer')
    ) {
        try {
            // Obtener el token del encabezado 
            token = req.headers.authorization.split(' ')[1];

            // 2. Decodificar el token usando la clave secreta
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            // 3. Obtener el usuario de la DB usando el ID decodificado
            req.usuario = await Usuario.findById(decoded.id).select('-contraseña');
            
            // 4. Continuar al controlador de la ruta
            next();
        } catch (error) {
            console.error(error);
            res.status(401); // 401: Unauthorized
            throw new Error('No autorizado, token fallido o expirado.');
        }
    }

    // Si no hay token en la cabecera
    if (!token) {
        res.status(401);
        throw new Error('No autorizado, no se encontró ningún token.');
    }
});

module.exports = { protect };