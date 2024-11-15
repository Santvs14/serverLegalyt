const IES = require('../models/Ies');

// Crear un nuevo registro IES
exports.createIES = async (req, res) => {
  try {
    const { nombres, apellidos, carrera, matricula, documentos } = req.body;
    const newIES = new IES({
      nombres,
      apellidos,
      carrera,
      matricula,
      documentos,
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

// Agregar URL de documentos a un registro IES existente
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
