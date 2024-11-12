/// routes/legalization.js
const express = require('express');
const router = express.Router();
const Solicitud = require('../models/Solicitud');
const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('../config/cloudinary'); 
const { getSolicitudes, actualizarEstadoSolicitud } = require('../controllers/SolicitudController'); // Asegúrate de que esté bien importado
const { guardarFirma } = require('../controllers/firmaController'); // Ajusta la ruta según tu estructura

router.post('/save-signature', guardarFirma); // Define la ruta para guardar la firma

// Configuración de almacenamiento de Cloudinary
const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'legalizacion',
        allowed_formats: ['jpg', 'png', 'pdf', 'jpeg'],
    },
});
const upload = multer({ storage: storage });

// Rutas
router.get('/requests', getSolicitudes); // Asegúrate de tener esta ruta

// PUT para actualizar una solicitud por ID
router.put('/requests/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const updatedSolicitud = await Solicitud.findByIdAndUpdate(id, req.body, { new: true });
        if (!updatedSolicitud) {
            return res.status(404).json({ message: 'Solicitud no encontrada' });
        }
        res.status(200).json(updatedSolicitud);
    } catch (error) {
        res.status(500).json({ message: 'Error al actualizar la solicitud', error });
    }
});
// Ruta para crear una nueva solicitud con archivos subidos a Cloudinary

// Ruta de prueba para solicitud sin archivos
router.post('/request', async (req, res) => {
    const { nombre, apellido, email, estado, archivos } = req.body;

    try {
        console.log('Datos de legalización recibidos:', req.body);
        res.status(201).json({ message: 'Solicitud de legalización enviada con éxito' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
