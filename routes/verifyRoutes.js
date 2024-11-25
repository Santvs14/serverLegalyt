const express = require('express');
const router = express.Router();
const { sendCode, verifyUser } = require('../controllers/userController');

// Ruta para enviar el código de verificación (email en este caso)
router.post('/send-code', sendCode);

// Ruta para verificar el código
router.post('/verify-code', verifyUser);

module.exports = router;
