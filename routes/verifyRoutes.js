const express = require('express');
const router = express.Router();  // Usamos router aquí, no app
const { sendCode, verifyUser } = require('../controllers/userController');
const sendVerificationEmail = require('../utils/sendVerifyEmail');  // Importa la función

// Ruta para enviar el código de verificación (email en este caso)
router.post('/send-code', async (req, res) => {
    try {
        const { email } = req.body;
        const result = await sendVerificationEmail(email);
        console.log('Resultado:', result); // Agrega log para verificar los datos
        res.status(200).json(result);
    } catch (error) {
        console.error('Error al enviar código:', error);
        res.status(500).json({ message: 'Error al enviar el código' });
    }
});

router.post('/verify-code', async (req, res) => {
    try {
        console.log('Datos recibidos para verificar código:', req.body); // Log para depurar datos recibidos

        const { email, verificationCode } = req.body;

        // Validar que email y verificationCode estén presentes
        if (!email || !verificationCode) {
            console.error('Faltan datos en la solicitud:', req.body);
            return res.status(400).json({ message: 'Correo electrónico y código son obligatorios' });
        }

        // Validar formato de email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email.trim())) {
            console.error('Formato de correo electrónico no válido:', email);
            return res.status(400).json({ message: 'Formato de correo electrónico no válido' });
        }

        // Validar que el código sea un número de 6 dígitos
        if (!/^\d{6}$/.test(verificationCode.trim())) {
            console.error('Formato de código no válido:', verificationCode);
            return res.status(400).json({ message: 'Formato de código no válido' });
        }

        // Llamar a la función de verificación
        await verifyUser(req, res);
    } catch (error) {
        console.error('Error al verificar código:', error); // Manejar errores inesperados
        res.status(500).json({ message: 'Error al verificar el código' });
    }
});

module.exports = router;
