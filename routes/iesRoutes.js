// routes/IESRoutes.js
const express = require('express');
const router = express.Router();
const { createIESRecord } = require('../controllers/iesController');
const IES = require('../models/Ies'); // Importa el modelo IES


// Ruta para crear un registro de IES con documentos
router.post('/ies', createIESRecord);


// Obtener todos los registros IES
router.get('/', async (req, res) => {
    try {
      const registros = await IES.find(); // Obtiene todos los registros
      res.json(registros);
    } catch (error) {
      res.status(500).json({ error: 'Error al obtener los registros' });
    }
  });
  

module.exports = router;
