const multer = require('multer');
const storage = multer.memoryStorage(); // Almacenamiento en memoria para buffers
const upload = multer({ storage });

const registrarIES = async (req, res) => {
  try {
    const { nombres, apellidos, carrera, matricula } = req.body;

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: 'No se enviaron documentos.' });
    }

    const documentUrls = req.files.map((file) => file.originalname); // Simulando URLs

    const nuevoIES = new IES({
      nombres,
      apellidos,
      carrera,
      matricula,
      documentos: documentUrls,
    });

    await nuevoIES.save();

    return res.status(201).json({
      message: 'Registro de IES exitoso',
      data: nuevoIES,
    });
  } catch (error) {
    console.error('Error al registrar IES:', error);
    return res.status(500).json({ error: 'Error interno del servidor.' });
  }
};

module.exports = { registrarIES, upload };
