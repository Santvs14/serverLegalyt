// src/routes/email.js
const express = require('express');
const nodemailer = require('nodemailer')


const router = express.Router();

// Configura tu transportador de Nodemailer
const transporter = nodemailer.createTransport({
    service: 'gmail', // o puedes usar el host y el puerto directamente
    auth: {
        user: 'tu-email@gmail.com',
        pass: 'tu-contraseña',
    },
});



// Ruta para enviar el correo
router.post('/send-email', async (req, res) => {
    try {
        const { email, subject, message } = req.body;
        await transporter.sendMail({
            from: 'santiagovasquez1402@gmail.com',
            to: email,
            subject: subject,
            text: message,
            
        });
        res.status(200).json({ message: 'Correo enviado con éxito' });
    } catch (error) {
        console.error('Error al enviar el correo:', error);
        res.status(500).json({ message: 'Error al enviar el correo', error: error.message });
    }
});



module.exports = router;
