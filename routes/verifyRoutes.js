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
        console.log('Datos recibidos para verificar código:', req.body);

        const { email, verificationCode } = req.body;

        // Validar que email y verificationCode estén presentes
        if (!email || !verificationCode) {
            console.error('Faltan datos en la solicitud:', req.body);
            return res.status(400).json({ message: 'Correo electrónico y código son obligatorios' });
        }



        // Validar que el código sea un número de 6 dígitos
        if (!/^\d{6}$/.test(sanitizedCode)) {
            console.error('Formato de código no válido:', sanitizedCode);
            return res.status(400).json({ message: 'Formato de código no válido' });
        }

        // Llamar a la función de verificación
        await verifyUser({ body: { email: sanitizedEmail, verificationCode: sanitizedCode } }, res);
    } catch (error) {
        console.error('Error al verificar código:', error);
        res.status(500).json({ message: 'Error al verificar el código' });
    }
});


module.exports = router;
