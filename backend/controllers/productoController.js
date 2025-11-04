const asyncHandler = require('express-async-handler');
const Producto = require('../models/Producto');

// @desc    Crear un nuevo producto para venta/donación
// @route   POST /api/productos
// @access  Privado
const crearProducto = asyncHandler(async (req, res) => {
    const { Nombre_Producto, Categoria, Descripcion, Estado, Tipo, Precio, Cantidad_Disponible, Ubicacion } = req.body;

    // --- CORRECCIÓN CRÍTICA: VALIDACIÓN DE CAMPOS OBLIGATORIOS ---
    if (!Nombre_Producto || !Categoria || !Descripcion || !Estado || !Tipo || !Ubicacion) {
        res.status(400);
        throw new Error('Faltan campos obligatorios: Nombre, Categoría, Descripción, Estado, Tipo y Ubicación.');
    }
    // -----------------------------------------------------------------

    // --- CORRECCIÓN: VALIDACIÓN DE PRECIO (SÓLO UNA VEZ) ---
    // También valida que el precio sea válido (no null/undefined) si el tipo es Venta.
    if (Tipo === 'Venta' && (Precio === undefined || Precio === null || isNaN(Number(Precio)))) {
        res.status(400);
        throw new Error('El precio es obligatorio y debe ser un número válido para productos de Venta.');
    }
    // -----------------------------------------------------------------
    
    const Foto_Producto = req.file ? req.file.path : null; 
    
    // El resto de la lógica de creación está PERFECTA para la trazabilidad
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
    
    // 1. CAPTURAR EL PARÁMETRO DE BÚSQUEDA 'q'
    const keyword = req.query.q 
        ? { 
            // Usa una expresión regular para buscar el término en el Nombre_Producto
            // '$options: "i"' hace que la búsqueda no distinga entre mayúsculas y minúsculas (case insensitive)
            Nombre_Producto: { $regex: req.query.q, $options: 'i' } 
          } 
        : {}; // Si no hay 'q', el filtro es un objeto vacío

    // 2. APLICAR EL FILTRO A MONGO (find({ ...keyword }))
    const productos = await Producto.find({ ...keyword }) // <-- Aplicación del filtro
        .populate('ID_Usuario', 'nombres') 
        .sort({ createdAt: -1 });

    res.status(200).json(productos);
});


// @desc    Obtener un solo producto por ID (Detalle)
// @route   GET /api/productos/:id
// @access  Privado
const getProducto = asyncHandler(async (req, res) => { 
    // Usa req.params.id para obtener el ID de la URL
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

    if (producto.ID_Usuario.toString() !== req.usuario.id) {
        res.status(401);
        throw new Error('Usuario no autorizado.');
    }

    await producto.deleteOne();
    res.status(200).json({ id: req.params.id, message: 'Producto eliminado.' });
});

// --- EXPORTACIÓN FINAL ---
module.exports = {
    crearProducto,
    getProductos,
    eliminarProducto,
    getProducto, // <--- Ahora está definida y exportada.
};