const asyncHandler = require('express-async-handler');
const Producto = require('../models/Producto');

// @desc    Crear un nuevo producto para venta/donación
// @route   POST /api/productos
// @access  Privado
const crearProducto = asyncHandler(async (req, res) => {
    // Desestructurar los datos del cuerpo
    const { Nombre_Producto, Categoria, Descripcion, Estado, Tipo, Precio, Cantidad_Disponible, Ubicacion } = req.body;

    if (!Nombre_Producto || !Categoria || !Descripcion || !Estado || !Tipo || !Ubicacion) {
        res.status(400);
        throw new Error('Faltan campos obligatorios del producto.');
    }
    
    // Obtener la ruta de la imagen si Multer la procesó
    const Foto_Producto = req.file ? req.file.path : null; 

    // Validar precio si es venta
    if (Tipo === 'Venta' && (Precio === undefined || Precio === null)) {
        res.status(400);
        throw new Error('El precio es obligatorio para productos de Venta.');
    }
    
    const producto = await Producto.create({
        ID_Usuario: req.usuario.id, // ID del usuario autenticado
        Nombre_Producto,
        Foto_Producto,
        Categoria,
        Descripcion,
        Estado,
        Tipo,
        Precio: Tipo === 'Venta' ? Precio : 0,
        Cantidad_Disponible,
        Ubicacion,
    });

    res.status(201).json(producto);
});

// @desc    Obtener todos los productos (Catálogo del Marketplace)
// @route   GET /api/productos
// @access  Público (requiere token para autenticar, pero cualquiera puede verlos)
const getProductos = asyncHandler(async (req, res) => {
    // Podrías filtrar por Tipo (Venta o Donación) usando req.query
    const productos = await Producto.find({})
        .populate('ID_Usuario', 'nombres') // Muestra el nombre del vendedor
        .sort({ createdAt: -1 });

    res.status(200).json(productos);
});

// @desc    Eliminar un producto
// @route   DELETE /api/productos/:id
// @access  Privado (Solo el autor)
const eliminarProducto = asyncHandler(async (req, res) => {
    const producto = await Producto.findById(req.params.id);

    if (!producto) {
        res.status(404);
        throw new Error('Producto no encontrado.');
    }

    // Seguridad: solo el autor puede eliminar
    if (producto.ID_Usuario.toString() !== req.usuario.id) {
        res.status(401);
        throw new Error('Usuario no autorizado.');
    }

    // Lógica para eliminar el archivo de imagen (similar a la publicación)
    // omitida aquí por brevedad, pero necesaria en la implementación final.

    await producto.deleteOne();
    res.status(200).json({ id: req.params.id, message: 'Producto eliminado.' });
});

module.exports = {
    crearProducto,
    getProductos,
    eliminarProducto,
    // La lógica de PUT/PATCH se implementaría aquí (similar a PublicacionController)
};