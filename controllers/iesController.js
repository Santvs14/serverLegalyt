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
    console.log('Datos recibidos del formulario:', req.body); // Verificar si los datos están llegando correctamente
    console.log('Archivos recibidos:', req.files); // Verificar si los archivos están llegando

    // Subir los documentos a Cloudinary
    const documentos = [];
    for (const file of req.files) {
      const result = await cloudinary.uploader.upload(file.path, {
        folder: 'IES-Documentos', // Carpeta donde se guardarán los documentos
      });
      documentos.push(result.secure_url); // Guardar la URL segura de cada archivo
    }

    // Crear el nuevo registro
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
    // Captura errores más específicos
    console.error('Error en la creación de IES:', error);  // Logs detallados del error
    res.status(500).json({ error: `Error al crear el registro: ${error.message}` });
  }
};


module.exports = {
  createIES,
};
