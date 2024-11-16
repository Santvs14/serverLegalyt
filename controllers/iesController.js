const cloudinary = require('cloudinary').v2;
const IES = require('../models/IES');
const multer = require('multer');
const { promisify } = require('util');

// Configurar multer para manejar la carga de archivos
const storage = multer.memoryStorage();
const upload = multer({ storage: storage }).array('documentos', 10); // Limitar a 10 archivos por solicitud

// Función para subir los documentos a Cloudinary
const uploadToCloudinary = async (file) => {
  try {
    const result = await cloudinary.uploader.upload_stream(
      { folder: 'IES - Documentos' },
      (error, result) => {
        if (error) {
          throw new Error('Error al subir archivo a Cloudinary');
        }
        return result;
      }
    );
    const buffer = Buffer.from(file.buffer);
    return await promisify(result)(buffer); // Esperar la respuesta de Cloudinary
  } catch (error) {
    console.error('Error subiendo documento:', error);
    throw error;
  }
};

// Controlador para registrar un nuevo IES
const registrarIES = async (req, res) => {
  upload(req, res, async (err) => {
    if (err) {
      return res.status(400).json({ error: 'Error al cargar los documentos' });
    }

    try {
      // Subir documentos a Cloudinary
      const documentUrls = [];
      for (let i = 0; i < req.files.length; i++) {
        const result = await uploadToCloudinary(req.files[i]);
        documentUrls.push(result.secure_url); // Almacenar la URL segura del archivo
      }

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
      return res.status(500).json({ error: 'Error al registrar los datos' });
    }
  });
};

module.exports = { registrarIES };
