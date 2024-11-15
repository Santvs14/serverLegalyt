const cloudinary = require('cloudinary').v2;
const multer = require('multer');
const IES = require('../models/Ies');

// Configurar Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Configuración de multer para manejar archivos
const storage = multer.memoryStorage();
const upload = multer({ storage: storage }).array('documentos', 5); // 'documentos' es el campo de formulario, máximo 5 archivos

// Crear un nuevo registro IES con los documentos
exports.createIES = async (req, res) => {
  try {
    const { nombres, apellidos, carrera, matricula } = req.body;

    // Primero subimos los archivos a Cloudinary
    const fileUrls = [];
    for (const file of req.files) {
      const result = await cloudinary.uploader.upload(file.buffer, {
        folder: 'Documentos Ies', // Carpeta en Cloudinary
        resource_type: 'auto', // Para que se suban automáticamente como imágenes o documentos, dependiendo del tipo
      });
      fileUrls.push(result.secure_url); // Guardamos las URLs de los archivos
    }

    // Creamos un nuevo registro IES con los documentos subidos
    const newIES = new IES({
      nombres,
      apellidos,
      carrera,
      matricula,
      documentos: fileUrls, // Guardamos las URLs de los documentos
    });

    await newIES.save();
    res.status(201).json({ message: 'Registro IES creado exitosamente', data: newIES });
  } catch (error) {
    res.status(500).json({ message: 'Error al crear el registro IES', error });
  }
};

// Obtener todos los registros IES
exports.getAllIES = async (req, res) => {
  try {
    const iesRecords = await IES.find();
    res.status(200).json(iesRecords);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener los registros IES', error });
  }
};

// Agregar documentos a un registro IES existente
exports.addDocument = async (req, res) => {
  try {
    const { id } = req.params;
    const { documentURL } = req.body;

    const iesRecord = await IES.findById(id);
    if (!iesRecord) {
      return res.status(404).json({ message: 'Registro IES no encontrado' });
    }

    iesRecord.documentos.push(documentURL);
    await iesRecord.save();
    res.status(200).json({ message: 'Documento agregado exitosamente', data: iesRecord });
  } catch (error) {
    res.status(500).json({ message: 'Error al agregar documento', error });
  }
};

// Middleware para la subida de archivos con multer
exports.uploadDocuments = upload; // Este middleware se utilizará en la ruta correspondiente
