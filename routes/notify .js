// backend/routes/notify.js

const express = require('express');
const router = express.Router();
const { notifyStatusChange } = require('../controllers/notifyController'); // Asegúrate de que la ruta sea correcta

router.post('/', async (req, res) => {
    const { email, estado, solicitudId } = req.body; // Asegúrate de que estás recibiendo estos campos

    if (!email || !estado || !solicitudId)  {
        return res.status(400).json({ message: 'Faltan campos requeridos' });
    }

    try {
        await notifyStatusChange(email, estado);
        res.status(200).json({ message: 'Notificación enviada correctamente' });
    } catch (error) {
        console.error('Error al enviar notificación:', error);
        res.status(500).json({ message: 'Error al enviar notificación' });
    }
});

module.exports = router;
