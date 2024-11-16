const cloudinary = require('cloudinary').v2;
const IES = require('../models/Ies');

// Configuración de Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const createIES = async (req, res) => {
  try {
    // Capturar los datos del formulario
    const { nombres, apellidos, carrera, matricula } = req.body;
    console.log('Datos del body:', req.body); // Verificar si los datos del formulario están llegando
    console.log('Archivos recibidos:', req.files); // Verificar si los archivos están llegando correctamente

    // Subir los documentos a Cloudinary
    const documentos = [];
    for (const file of req.files) {
      const result = await cloudinary.uploader.upload(file.path, {
        folder: 'IES-Documentos', // Carpeta donde se guardarán los documentos
      });
      documentos.push(result.secure_url); // Guardamos la URL segura de cada archivo
    }

    // Crear un nuevo registro en la colección IES con los datos y las URLs de los documentos
    const nuevoIES = new IES({
      nombres,
      apellidos,
      carrera,
      matricula,
      documentos, // Aquí guardamos las URLs de los documentos
    });

    // Guardar el nuevo registro
    await nuevoIES.save();
    res.status(201).json({ message: 'Registro creado exitosamente', nuevoIES });
  } catch (error) {
    console.error('Error al crear el IES:', error); // Mensaje más claro para depuración
    res.status(500).json({ error: 'Error al crear el registro' });
  }
};

module.exports = {
  createIES,
};
