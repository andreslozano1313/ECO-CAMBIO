const asyncHandler = require('express-async-handler');
const Publicacion = require('../models/Publicacion');
const Usuario = require('../models/Usuario'); 
const fs = require('fs'); // Librería de Node para trabajar con el sistema de archivos
const path = require('path');

// @desc    Crear una nueva publicación de acción ecológica
// @route   POST /api/publicaciones
// @access  Privado
const crearPublicacion = asyncHandler(async (req, res) => {
    console.log("Datos de texto recibidos (req.body):", req.body);
    console.log("Objeto de archivo recibido (req.file):", req.file);
    const { texto, puntosOtorgados = 10 } = req.body; 

    if (!texto) {
        res.status(400);
        throw new Error('Por favor, agrega el texto de tu acción ecológica.');
    }

    // 1. esto obtiene la ruta de la imagen si se subió
    const urlImagen = req.file ? req.file.path : null; 

    // 2. crea la nueva publicación
    const publicacion = await Publicacion.create({
        autor: req.usuario.id,
        texto,
        urlImagen,
        puntosOtorgados: Number(puntosOtorgados),
    });

    // 3. Lógica Transaccional
    await Usuario.findByIdAndUpdate(
        req.usuario.id,
        { 
            // va a incrementa el valor actual del campo
            $inc: { puntuacionTotal: Number(puntosOtorgados) } 
        },
        { new: true } // va a devolver el documento actualizado
    );

    res.status(201).json({
        message: '¡Acción ecológica publicada con éxito!',
        publicacion: publicacion,
        puntosGanados: Number(puntosOtorgados)
    });
});

// @desc    Obtener todas las publicaciones 
// @route   GET /api/publicaciones
// @access  Privado (aunque es público, requiere estar logueado)
const getPublicaciones = asyncHandler(async (req, res) => {
    // 1. Capturamos el query de búsqueda, si existe
    const keyword = req.query.q 
        ? {
              // Si hay búsqueda, busca 'texto' usando una expresión regular (case insensitive)
              texto: { $regex: req.query.q, $options: 'i' }, 
          }
        : {}; // Si no hay búsqueda, el filtro es un objeto vacío

    // 2. Aplicamos el filtro a .find()
    const publicaciones = await Publicacion.find({ ...keyword }) // Aplica el filtro (o no aplica nada)
        .populate('autor', 'nombres fotoPerfil')
        .sort({ createdAt: -1 });

    res.status(200).json(publicaciones);
});

// @desc    Eliminar una publicación
// @route   DELETE /api/publicaciones/:id
// @access  Privado
const eliminarPublicacion = asyncHandler(async (req, res) => {
    const publicacion = await Publicacion.findById(req.params.id);

    if (!publicacion) {
        res.status(404);
        throw new Error('Publicación no encontrada.');
    }

    // 1. Verificar si el usuario autenticado es el autor de la publicación
    // req.usuario.id es un string, publicacion.autor es un ObjectId
    if (publicacion.autor.toString() !== req.usuario.id) {
        res.status(401);
        throw new Error('Usuario no autorizado para eliminar esta publicación.');
    }

    // 2. Eliminar la imagen del almacenamiento local (si existe)
    if (publicacion.urlImagen) {
        // Obtenemos la ruta absoluta del archivo en el servidor
        const filePath = path.join(__dirname, '..', publicacion.urlImagen); 
        fs.unlink(filePath, (err) => {
            if (err) console.error("Error al eliminar la imagen:", err);
        });
    }

    // 3. Eliminar la publicación de la base de datos
    await publicacion.deleteOne();

    res.status(200).json({ 
        message: 'Publicación eliminada correctamente.', 
        id: req.params.id 
    });
});

// @desc    Actualizar una publicación (Texto y/o Foto)
// @route   PUT /api/publicaciones/:id
// @access  Privado
const actualizarPublicacion = asyncHandler(async (req, res) => {
    const publicacionId = req.params.id;
    const publicacion = await Publicacion.findById(publicacionId);

    if (!publicacion) {
        res.status(404);
        throw new Error('Publicación no encontrada.');
    }

    // 1. Verificar si el usuario autenticado es el autor
    if (publicacion.autor.toString() !== req.usuario.id) {
        res.status(401);
        throw new Error('Usuario no autorizado para actualizar esta publicación.');
    }

    // 2. Preparar los datos para la actualización
    let datosActualizados = {
        texto: req.body.texto || publicacion.texto, // Actualiza el texto si viene en el body
    };

    // 3. Manejo de la foto: Si se sube un nuevo archivo, reemplazamos el anterior
    if (req.file) {
        // a) Eliminar la imagen antigua del almacenamiento local (si existe)
        if (publicacion.urlImagen) {
            const filePath = path.join(__dirname, '..', publicacion.urlImagen);
            fs.unlink(filePath, (err) => {
                if (err) console.error("Error al eliminar la imagen antigua:", err);
            });
        }
        // b) Asignar la nueva URL de la imagen
        datosActualizados.urlImagen = req.file.path;
    }

    // 4. Ejecutar la actualización en MongoDB
    const publicacionActualizada = await Publicacion.findByIdAndUpdate(
        publicacionId,
        datosActualizados,
        { new: true, runValidators: true } // {new: true} devuelve el documento actualizado
    ).populate('autor', 'nombres');

    res.status(200).json({
        message: 'Publicación actualizada correctamente.',
        publicacion: publicacionActualizada
    });
});


module.exports = {
    crearPublicacion,
    getPublicaciones,
    eliminarPublicacion,
    actualizarPublicacion,
    getPublicaciones
};