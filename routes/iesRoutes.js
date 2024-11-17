// routes/IESRoutes.js
const express = require('express');
const router = express.Router();
const { createIESRecord } = require('../controllers/iesController');

// Ruta para crear un registro de IES con documentos
router.post('/ies', createIESRecord);

module.exports = router;
