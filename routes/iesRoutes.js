const express = require('express');
const router = express.Router();
const multer = require('multer');
const iesController = require('../controllers/iesController');

// Configuración de Multer para manejar archivos en el backend
const storage = multer.diskStorage({});
const upload = multer({ storage });

// Ruta para crear un nuevo registro de IES
router.post('/create', iesController.createIES);

module.exports = router;
