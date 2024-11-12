
//routes/certificacionRoutes
const express = require('express');
const router = express.Router();
const { generarCertificado } = require('../controllers/certificacionController');

// Ruta para generar y descargar el certificado PDF
router.get('/request/:id', generarCertificado);








module.exports = router;
