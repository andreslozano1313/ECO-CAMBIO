const multer = require('multer');
const path = require('path');

// 1. Configurar el almacenamiento
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        // La carpeta donde se va a guardar las imágenes subidas
        cb(null, 'uploads/'); 
    },
    filename: (req, file, cb) => {
        
        cb(null, `${req.usuario.id}-${Date.now()}${path.extname(file.originalname)}`);
    },
});

// 2. Filtrar tipos de archivo
const fileFilter = (req, file, cb) => {
    // Aceptar solo JPEG o PNG
    if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png') {
        cb(null, true);
    } else {
        // Rechazar archivo
        cb(new Error('Tipo de archivo no soportado. Solo JPEG y PNG son permitidos.'), false);
    }
};

// 3. Inicializar Multer con la configuración
const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 1024 * 1024 * 5 // Límite de 5MB
    }
});

module.exports = upload;