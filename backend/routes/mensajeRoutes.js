const express = require('express');
const router = express.Router();
const { enviarMensajeInteres, getMensajesRecibidos } = require('../controllers/mensajeController');
const { protect } = require('../middleware/authMiddleware');

router.post('/', protect, enviarMensajeInteres);
// Aquí irían las rutas GET para obtener mensajes propios (emisor o receptor)
router.get('/recibidos', protect, getMensajesRecibidos);

module.exports = router;