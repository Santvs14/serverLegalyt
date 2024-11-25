const express = require('express');
const router = express.Router();
const { sendCode, verifyUser } = require('../controllers/userController');

// Ruta para enviar el código de verificación (email en este caso)
router.post('/send-code', async (req, res) => {
    const { email } = req.body;

    if (!email) {
        return res.status(400).json({ message: 'El correo electrónico es obligatorio.' });
    }

    try {
        // Llamada a la función para enviar el correo de verificación
        const { code, expiresAt } = await sendVerificationEmail(email);

        // Si el código fue enviado correctamente, respondemos con éxito
        return res.status(200).json({
            message: 'Código de verificación enviado con éxito',
            code, // Solo se podría enviar el código si es necesario para el cliente
            expiresAt
        });

    } catch (error) {
        console.error('Error al enviar el código:', error.message || error);
        return res.status(500).json({ message: 'Error al enviar el código de verificación', error: error.message || error });
    }
});

// Ruta para verificar el código
router.post('/verify-code', verifyUser);

module.exports = router;
