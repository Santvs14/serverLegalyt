const cloudinary = require('cloudinary').v2;
const IES = require('../models/Ies');
require('dotenv').config();
const streamifier = require('streamifier');

// Configuración de Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Función para subir archivos a Cloudinary usando buffers
const uploadToCloudinary = (buffer) => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      { folder: 'IES - Documentos' },
      (error, result) => {
        if (error) {
          console.error('Error subiendo archivo a Cloudinary:', error);
          return reject(error);
        }
        resolve(result.secure_url); // URL del archivo subido
      }
    );
    streamifier.createReadStream(buffer).pipe(uploadStream); // Convierte el buffer en stream
  });
};

// Controlador para registrar un nuevo IES
const registrarIES = async (req, res) => {
  try {
    const files = req.files; // Archivos enviados en la solicitud
    if (!files || files.length === 0) {
      return res.status(400).json({ error: 'No se enviaron documentos para cargar' });
    }

    // Subir documentos a Cloudinary
    const documentUrls = await Promise.all(
      files.map((file) => uploadToCloudinary(file.buffer))
    );

    // Crear un nuevo registro IES
    const nuevoIES = new IES({
      nombres: req.body.nombres,
      apellidos: req.body.apellidos,
      carrera: req.body.carrera,
      matricula: req.body.matricula,
      documentos: documentUrls,
    });

    // Guardar en la base de datos
    await nuevoIES.save();

    return res.status(201).json({
      message: 'Registro de IES exitoso',
      data: nuevoIES,
    });
  } catch (error) {
    console.error('Error al registrar IES:', error);
    return res.status(500).json({ error: 'Error al registrar los datos' });
  }
};

module.exports = { registrarIES };
