
const express = require('express');
const router = express.Router();
const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('../config/cloudinary');
const Solicitud = require('../models/Solicitud'); 
const User = require('../models/User'); // Importa el modelo de Usuario
const { notifyStatusChange } = require('../controllers/notificationController'); // Asegúrate de que la ruta sea correcta



// Configuración de almacenamiento de Cloudinary
const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'legalizacion',
        allowed_formats: ['jpg', 'png', 'pdf', 'jpeg'],
    },
});

// Inicializar multer con la configuración de Cloudinary
const upload = multer({ storage });

// Función para obtener la hora actual con API Publica


// Ruta para crear una nueva solicitud con archivos subidos a Cloudinary
router.post('/', upload.fields([{ name: 'archivos' }, { name: 'documentos' }]), async (req, res) => {
    console.log('Solicitud recibida:', req.body);
    console.log('Archivos:', req.files);

    try {
        // Obtener la hora actual
       // const currentTime = await getCurrentTime();
       // console.log('Hora actual:', currentTime);
       const currentTime = new Date().toISOString();

        const archivosUrls = req.files.archivos ? req.files.archivos.map(file => file.path) : [];
        const documentosUrls = req.files.documentos ? req.files.documentos.map(file => file.path) : [];

        const nuevaSolicitud = new Solicitud({
            ...req.body,
            archivos: archivosUrls,
            documentos: documentosUrls,
            timestamp: currentTime, // Guardar la hora actual en la solicitud, si es necesario
        });

        await nuevaSolicitud.save();


 // Obtener el usuario y su email
 const user = await User.findById(req.body.userId); // Asegúrate de que el ID de usuario esté incluido
 if (user) {
     // Notificar al usuario sobre el estado 'pendiente'
     await notifyStatusChange(user.email, 'pendiente');
     console.log('Notificación enviada a:', user.email);
 } else {
     console.error('Usuario no encontrado para el ID:', req.body.userId);
 }


        res.status(201).json({ message: 'Solicitud guardada correctamente' });
        console.log('Solicitud realizada con éxito:', nuevaSolicitud);
    } catch (error) {
        console.error('Error al guardar la solicitud:', error);
        res.status(500).json({ message: 'Error al guardar la solicitud', details: error.message });
    }
});
module.exports = router;
