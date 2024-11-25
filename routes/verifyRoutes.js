const express = require('express');
const router = express.Router();
const { sendCode, verifyUser } = require('../controllers/userController');
const sendVerificationEmail = require('../utils/sendVerifyEmail');  // Importa la función


// Ruta para enviar el código de verificación (email en este caso)
// En el backend
app.post('/send-code', async (req, res) => {
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


// Ruta para verificar el código
router.post('/verify-code', verifyUser);

module.exports = router;
