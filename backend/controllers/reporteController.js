const asyncHandler = require('express-async-handler');
const Reporte = require('../models/Reporte');
const upload = require('../config/multerConfig'); // Reutilizamos el middleware de Multer

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
    // Para simplificar, obtenemos todos los reportes.
    // En una aplicación real, se usaría una consulta $near de MongoDB para filtrar por proximidad.
    const reportes = await Reporte.find({})
        .populate('autor', 'nombres'); 
        
    res.status(200).json(reportes);
});

module.exports = {
    crearReporte,
    getReportes,
};