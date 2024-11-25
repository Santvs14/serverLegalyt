const express = require('express');
const router = express.Router();
const Verification = require('../models/Verification'); // Importa el modelo
const twilio = require('twilio');

// Configura Twilio
const client = twilio('TWILIO_ACCOUNT_SID', 'TWILIO_AUTH_TOKEN');

//Ruta para verificar el código ingresado por el usuario
// Ruta para enviar el código
router.post('/send-code', async (req, res) => {
  const { phoneNumber } = req.body;

  if (!phoneNumber) {
    return res.status(400).json({ message: 'Número de teléfono requerido' });
  }

  const { code, expiresAt } = generateVerificationCode();

  try {
    // Guarda el código en la base de datos
    await Verification.create({ phoneNumber, verificationCode: code, expiresAt });

    // Envía el código por SMS
    await client.messages.create({
      body: `Tu código de verificación es: ${code}`,
      from: '+1234567890', // Número de Twilio
      to: phoneNumber,
    });

    res.status(200).json({ message: 'Código enviado exitosamente' });
  } catch (error) {
    res.status(500).json({ message: 'Error al enviar el código', error });
  }
});

//Ruta para verificar el código ingresado por el usuario
router.post('/verify-code', async (req, res) => {
    const { phoneNumber, verificationCode } = req.body;
  
    if (!phoneNumber || !verificationCode) {
      return res.status(400).json({ message: 'Teléfono y código requeridos' });
    }
  
    try {
      // Busca el código en la base de datos
      const record = await Verification.findOne({ phoneNumber, verificationCode });
  
      if (!record) {
        return res.status(400).json({ message: 'Código incorrecto' });
      }
  
      // Verifica si el código ha expirado
      if (record.expiresAt < new Date()) {
        return res.status(400).json({ message: 'El código ha expirado' });
      }
  
      // Elimina el código de la base de datos después de usarlo
      await Verification.deleteOne({ _id: record._id });
  
      res.status(200).json({ message: 'Código verificado exitosamente' });
    } catch (error) {
      res.status(500).json({ message: 'Error al verificar el código', error });
    }
  });
  
module.exports = router;
