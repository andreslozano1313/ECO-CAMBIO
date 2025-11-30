const dotenv = require('dotenv').config();
const express = require('express');
const connectDB = require('./config/db');
const { errorHandler } = require('./middleware/errorMiddleware');
const cors = require('cors'); // Asegúrate de que esta línea esté presente

const port = process.env.PORT || 5000;

connectDB();

const app = express();

// --- CAMBIO IMPORTANTE AQUÍ ---
// Eliminamos la restricción de localhost. 
// Al dejar los paréntesis vacíos, permitimos conexiones desde cualquier lugar (incluido Render).
app.use(cors()); 
// ------------------------------

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use('/uploads', express.static('uploads'));
app.use('/api/reportes', require('./routes/reporteRoutes'));
/*app.use('/api/transacciones', require('./routes/transaccionRoutes'));*/
app.use('/api/mensajes', require('./routes/mensajeRoutes'));
app.use('/api/notificaciones', require('./routes/notificacionRoutes'));

// 1. ruta para autenticacion
app.use('/api/auth', require('./routes/authRoutes'));

// 2. Rutas de Usuario (Privadas, requerirán protección)
app.use('/api/usuarios', require('./routes/usuarioRoutes'));

// 3. Ruta para manejo de publicaciones
app.use('/api/publicaciones', require('./routes/publicacionRoutes'));

// Rutas de Productos (Marketplace)
app.use('/api/productos', require('./routes/productoRoutes'));

// 3. Manejador de errores
app.use(errorHandler);

app.listen(port, () => console.log(`Server started on port ${port}`));