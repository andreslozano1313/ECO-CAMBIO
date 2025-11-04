const asyncHandler = require('express-async-handler');
const Reporte = require('../models/Reporte');
const fs = require('fs'); // <-- NECESARIO: Módulo para eliminar archivos
// const upload = require('../config/multerConfig'); // No es necesario importarlo aquí

// @desc    Crear un nuevo reporte ciudadano con ubicación
// @route   POST /api/reportes
// @access  Privado
const crearReporte = asyncHandler(async (req, res) => {
    const { descripcion, latitud, longitud } = req.body;

    if (!descripcion || !latitud || !longitud) {
        res.status(400);
        throw new Error('Descripción, latitud y longitud son obligatorios.');
    }
    
    // Obtener la ruta de la imagen si se subió
    const urlFoto = req.file ? req.file.path : null; 

    // Crear el reporte con el formato GeoJSON Point
    const reporte = await Reporte.create({
        autor: req.usuario.id, 
        descripcion,
        urlFoto,
        ubicacion: {
            type: 'Point',
            coordinates: [parseFloat(longitud), parseFloat(latitud)], // [longitud, latitud]
        },
    });

    res.status(201).json({
        message: 'Reporte ciudadano enviado con éxito.',
        reporte: reporte
    });
});

// @desc    Obtener todos los reportes (o cerca de un punto, para el mapa)
// @route   GET /api/reportes
// @access  Privado
const getReportes = asyncHandler(async (req, res) => {
    const reportes = await Reporte.find({})
        .populate('autor', 'nombres'); 
        
    res.status(200).json(reportes);
});

// @desc    Eliminar un reporte ciudadano (Marcar como Resuelto)
// @route   DELETE /api/reportes/:id
// @access  Privado (Solo el autor)
const eliminarReporte = asyncHandler(async (req, res) => {
    const reporte = await Reporte.findById(req.params.id);

    if (!reporte) {
        res.status(404);
        throw new Error('Reporte no encontrado.');
    }

    // 1. Verificar la Autoría (Seguridad)
    // El ID del autor en el reporte (ObjectId) debe coincidir con el ID del usuario logueado (String)
    if (reporte.autor.toString() !== req.usuario.id) {
        res.status(401);
        throw new Error('Usuario no autorizado para eliminar este reporte.');
    }

    // 2. Eliminar la Imagen del Servidor (si existe)
    if (reporte.urlFoto) {
        // fs.unlink(path) elimina el archivo del disco
        fs.unlink(reporte.urlFoto, (err) => {
            if (err) console.error("Error al eliminar la imagen del reporte:", err);
            // El reporte se elimina de la DB aunque la imagen falle en el disco.
        });
    }

    // 3. Eliminar el Reporte de la Base de Datos
    await reporte.deleteOne();

    res.status(200).json({ 
        id: req.params.id, 
        message: 'Reporte eliminado y problema marcado como resuelto.' 
    });
});


module.exports = {
    crearReporte,
    getReportes,
    eliminarReporte, // <-- ¡NUEVA FUNCIÓN EXPORTADA!
};