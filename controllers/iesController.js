// controllers/IESController.js
const IES = require('../models/Ies');
const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('cloudinary').v2;
const dotenv = require('dotenv');

// Cargar variables de entorno
dotenv.config();

// Configuración de Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Configuración de Multer y Cloudinary Storage
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'documentos IES',
    allowed_formats: ['jpg', 'jpeg', 'png'],
    transformation: [{ width: 500, height: 500, crop: 'limit' }],
  },
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB por archivo
});

// Subir documentos y crear un nuevo registro
const createIESRecord = async (req, res) => {
  upload.array('documentos', 10)(req, res, async (err) => {
    if (err instanceof multer.MulterError) {
      // Errores de Multer
      return res.status(400).json({ error: err.message });
    } else if (err) {
      // Otros errores
      return res.status(400).json({ error: err.message });
    }

    try {
      const { nombres, apellidos, carrera, matricula, universidad } = req.body;

      // Verificar campos requeridos
      if (!nombres || !apellidos || !carrera || !matricula || !universidad) {
        return res.status(400).json({ error: 'Todos los campos son requeridos' });
      }

      // Obtener URLs de los documentos subidos
      const documentos = req.files ? req.files.map((file) => file.path) : [];

      const newRecord = new IES({ nombres, apellidos, carrera, matricula, universidad, documentos });
      const savedRecord = await newRecord.save();

      res.status(201).json(savedRecord);
    } catch (error) {
      // Manejo de errores de MongoDB (por ejemplo, duplicados)
      if (error.code === 11000) {
        return res.status(400).json({ error: 'La matrícula ya existe' });
      }
      res.status(500).json({ error: 'Error al guardar el registro', details: error.message });
    }
  });
};

module.exports = { createIESRecord };
