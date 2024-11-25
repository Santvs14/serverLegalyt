const express = require('express');
const router = express.Router();
const { registerUser, verifyUser } = require('../controllers/userController');

// Ruta para registrar al usuario
router.post('/register', registerUser);

// Ruta para verificar el código de verificación
router.post('/verify', verifyUser);

module.exports = router;
