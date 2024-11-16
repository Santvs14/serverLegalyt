const IES = require('../models/Ies');
const cloudinary = require('cloudinary').v2;

// Configuración de Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Crear un nuevo registro en la colección IES
const createIES = async (req, res) => {
  try {
    const { nombres, apellidos, carrera, matricula } = req.body;

    // Subir documentos a Cloudinary
    const documentos = [];
    for (const file of req.files) {
      const result = await cloudinary.uploader.upload(file.path, {
        folder: 'IES-Documents',
      });
      documentos.push(result.secure_url); // URL segura del documento
    }

    // Crear el registro
    const nuevoIES = new IES({
      nombres,
      apellidos,
      carrera,
      matricula,
      documentos,
    });

    await nuevoIES.save();
    res.status(201).json({ message: 'Registro creado exitosamente', nuevoIES });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al crear el registro' });
  }
};
// En tu IESController.js
exports.createIES = (req, res) => {
  console.log("Datos recibidos:", req.body);
  res.status(200).send({ message: "IES creado correctamente" });
};

// Exportar los controladores
module.exports = {
  createIES,
};
