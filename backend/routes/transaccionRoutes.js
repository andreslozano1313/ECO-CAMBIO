const express = require('express');
const router = express.Router();
const { simularPago } = require('../controllers/transaccionController');
const { protect } = require('../middleware/authMiddleware');

router.post('/simular', protect, simularPago);

module.exports = router;