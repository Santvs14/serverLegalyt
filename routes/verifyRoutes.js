const express = require('express');
const router = express.Router();
const { sendCode, verifyUser } = require('../controllers/userController');

// Ruta para enviar código
router.post('/send-code', sendCode);

// Ruta para verificar código
router.post('/verify-code', verifyUser);

module.exports = router;
