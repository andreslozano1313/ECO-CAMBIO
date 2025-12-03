const asyncHandler = require('express-async-handler');
const Producto = require('../models/Producto');
const Mensaje = require('../models/Mensaje'); 
const fs = require('fs');

// @desc    Crear un nuevo producto para venta/donación
// @route   POST /api/productos
// @access  Privado
const crearProducto = asyncHandler(async (req, res) => {
    const { Nombre_Producto, Categoria, Descripcion, Estado, Tipo, Precio, Cantidad_Disponible, Ubicacion } = req.body;

    // VALIDACIÓN DE CAMPOS OBLIGATORIOS
    if (!Nombre_Producto || !Categoria || !Descripcion || !Estado || !Tipo || !Ubicacion) {
        res.status(400);
        throw new Error('Faltan campos obligatorios: Nombre, Categoría, Descripción, Estado, Tipo y Ubicación.');
    }
    // -----------------------------------------------------------------

    // VALIDACIÓN DE PRECIO 
    // También valida que el precio sea válido 
    if (Tipo === 'Venta' && (Precio === undefined || Precio === null || isNaN(Number(Precio)))) {
        res.status(400);
        throw new Error('El precio es obligatorio y debe ser un número válido para productos de Venta.');
    }
    // -----------------------------------------------------------------
    
    const Foto_Producto = req.file ? req.file.path : null; 
    
    
    const producto = await Producto.create({
        ID_Usuario: req.usuario.id,
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

// ----------------------------------------------------
// FUNCIONES DE LECTURA (GET)
// ----------------------------------------------------

// @desc    Obtener todos los productos (Catálogo del Marketplace)
// @route   GET /api/productos
// @access  Privado
const getProductos = asyncHandler(async (req, res) => {
    
    // 1. CAPTURAR EL PARÁMETRO DE BÚSQUEDA
    const keyword = req.query.q 
        ? { 
            
            Nombre_Producto: { $regex: req.query.q, $options: 'i' } 
          } 
        : {}; 

    // 2. APLICAR EL FILTRO A MONGO
    const productos = await Producto.find({ ...keyword }) // <-- Aplicación del filtro
        .populate('ID_Usuario', 'nombres') 
        .sort({ createdAt: -1 });

    res.status(200).json(productos);
});


// @desc    Obtener un solo producto por ID (Detalle)
// @route   GET /api/productos/:id
// @access  Privado
const getProducto = asyncHandler(async (req, res) => { 
    
    const producto = await Producto.findById(req.params.id)
        .populate('ID_Usuario', 'nombres'); 

    if (!producto) {
        res.status(404);
        throw new Error('Producto no encontrado.'); 
    }

    res.status(200).json(producto);
});

// ----------------------------------------------------
// FUNCIÓN DE ELIMINACIÓN (DELETE)
// ----------------------------------------------------

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

    // 1. LÓGICA DE ELIMINACIÓN EN CASCADA: Borrar todos los mensajes asociados
    await Mensaje.deleteMany({ producto: req.params.id }); 
    console.log(`Mensajes asociados al producto ${req.params.id} eliminados en cascada.`);

    // 2. Eliminar la Imagen del Servidor 
    if (producto.Foto_Producto) {
        fs.unlink(producto.Foto_Producto, (err) => {
            if (err) console.error("Error al eliminar la imagen del producto:", err);
        });
    }

    // 3. Eliminar el Producto
    await producto.deleteOne();
    
    res.status(200).json({ id: req.params.id, message: 'Producto y conversaciones eliminados.' });
});


module.exports = {
    crearProducto,
    getProductos,
    eliminarProducto,
    getProducto, 
};