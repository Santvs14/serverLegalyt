const cloudinary = require('cloudinary').v2;  // Asegúrate de tener Cloudinary configurado
const IES = require('../models/Ies');  // Tu modelo de IES
const multer = require('multer');  // Para manejar la subida de archivos
const fs = require('fs');  // Para eliminar archivos locales si es necesario

// Configuración de Multer (si aún no lo has hecho)
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, './uploads'); // Directorio local temporal
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  }
});
const upload = multer({ storage: storage });

// Función para subir archivos a Cloudinary
const uploadToCloudinary = (filePath) => {
  return new Promise((resolve, reject) => {
    cloudinary.uploader.upload(filePath, (error, result) => {
      if (error) {
        reject(error);
      } else {
        resolve(result.secure_url);  // Retorna la URL de la imagen subida
      }
    });
  });
};

// Función para crear un nuevo registro y subir los archivos
const createIES = async (req, res) => {
  try {
    console.log('Recibiendo los datos del formulario:', req.body);

    // Primero, guarda los datos en la base de datos sin los archivos
    const { nombres, apellidos, carrera, matricula } = req.body;
    const iesData = new IES({ nombres, apellidos, carrera, matricula });

    // Guardar en la base de datos
    const newIES = await iesData.save();
    console.log('Registro creado con éxito en la base de datos:', newIES);

    // Subir los archivos a Cloudinary
    const uploadedFiles = [];
    for (let i = 0; i < req.files.length; i++) {
      const filePath = req.files[i].path;
      const fileUrl = await uploadToCloudinary(filePath);
      uploadedFiles.push(fileUrl);
      fs.unlinkSync(filePath);  // Eliminar el archivo local después de subirlo a Cloudinary
    }

    // Actualizar el registro con las URLs de los archivos
    newIES.documentos = uploadedFiles;
    await newIES.save();
    console.log('Archivos subidos y URLs actualizadas en la base de datos:', uploadedFiles);

    // Responder al cliente
    res.status(201).json({ message: 'Registro exitoso y archivos subidos', data: newIES });

  } catch (error) {
    console.error('Error en el proceso de registro:', error);
    res.status(500).json({ message: 'Error al procesar la solicitud', error: error.message });
  }
};

module.exports = { createIES, upload };  // Exportar para usar en las rutas
