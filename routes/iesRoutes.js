// En tu archivo de rutas
const express = require('express');
const router = express.Router();
const iesController = require('../controllers/iesController');

// Ruta para crear un nuevo registro IES con archivos
router.post('/api/ies', iesController.uploadDocuments, iesController.createIES);

// Ruta para agregar documentos a un registro IES existente
router.put('/api/ies/:id/documento', iesController.uploadDocuments, iesController.addDocument);

module.exports = router;
