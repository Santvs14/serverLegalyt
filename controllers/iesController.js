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
    console.log('Datos del body:', req.body); // Verificar si los datos del formulario están llegando
    console.log('Archivos recibidos:', req.files); // Verificar si los archivos están llegando correctamente

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
    console.error('Error al crear el IES:', error); // Mensaje más claro para depuración

    res.status(500).json({ error: 'Error al crear el registro' });
  }
};

// Exportar los controladores
module.exports = {
  createIES,
};
