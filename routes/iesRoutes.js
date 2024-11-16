const express = require('express');
const router = express.Router();
const multer = require('multer');
const iesController = require('../controllers/iesController');

// Configuración de Multer para manejar archivos
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/'); // Asigna el directorio donde se almacenarán los archivos
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  }
});
const upload = multer({ storage });

// Ruta para crear un nuevo registro de IES
router.post('/create', upload.array('documentos'), iesController.createIES); // Asegúrate de usar el middleware de multer aquí

module.exports = router;
