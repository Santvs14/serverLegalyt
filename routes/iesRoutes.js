const express = require('express');
const router = express.Router();
const iesController = require('../controllers/iesController');

// Ruta para crear un nuevo registro IES
router.post('/create', iesController.createIES);

// Ruta para obtener todos los registros IES
router.get('/', iesController.getAllIES);

// Ruta para agregar un documento a un registro IES existente
router.put('/:id/add-document', iesController.addDocument);

module.exports = router;
