const express = require('express');
const router = express.Router();
const iesController = require('../controllers/iesController');

// Definir la ruta para crear un nuevo registro IES
router.post('/api/ies', iesController.createIES);


// Ruta para obtener todos los registros IES
router.get('/ies', iesController.getAllIES);

// Ruta para agregar un nuevo documento a un registro IES
router.put('/:id/documento', iesController.uploadDocuments, iesController.addDocument);

module.exports = router;
