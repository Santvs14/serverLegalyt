const express = require('express');
const { createIES, upload } = require('../controllers/iesController');  // Controlador
const router = express.Router();

// Ruta para crear IES y subir archivos
router.post('/create', upload.array('documentos'), createIES);

module.exports = router;
