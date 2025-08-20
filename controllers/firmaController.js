const Firma = require('../models/Firma');

const guardarFirma = async (req, res) => {
  const { firmaDataUrl, adminId, solicitudId } = req.body;
  //setUser({ ...data, adminId: data.adminId }); // Asegúrate de que adminId esté presente
  console.log('Valor adminId:', adminId);

  try {
    const nuevaFirma = new Firma({
      firmaDigital:firmaDataUrl,
      admins: adminId,       // Asegúrate de que coincida con el modelo
      solicituds: solicitudId // Asegúrate de que coincida con el modelo
    });

    await nuevaFirma.save();
    console.log('Firma guardada exitosamente:', nuevaFirma);

    res.status(201).json({ message: 'Firma guardada exitosamente', firma: nuevaFirma });
  } catch (error) {
    console.error('Error al guardar la firma:', error);
    res.status(500).json({ message: 'Error al guardar la firma' });
  }
};

module.exports = { guardarFirma };
