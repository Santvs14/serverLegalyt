const express = require('express');
const router = express.Router();
const iesController = require('../controllers/iesController');

// Ruta para crear un nuevo registro IES con documentos
router.post('/ies', iesController.uploadDocuments, iesController.createIES);

// Ruta para obtener todos los registros IES
router.get('/ies', iesController.getAllIES);

// Ruta para agregar un nuevo documento a un registro IES
router.post('/ies/:id/documento', iesController.addDocument);

module.exports = router;
