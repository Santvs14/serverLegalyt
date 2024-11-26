const express = require('express');
const Verification = require('../models/Verification'); // Modelo para almacenar códigos de verificación
const sendVerificationEmail = require('../utils/sendVerifyEmail'); // Ruta del archivo de verificación

// Función para enviar el código de verificación al correo electrónico
const sendCode = async (req, res) => {
    const { email } = req.body;

    if (!email) {
        return res.status(400).json({ message: 'Correo electrónico es obligatorio' });
    }

    try {
        // Generar código y fecha de expiración
        const { code, expiresAt } = await sendVerificationEmail(email);

        console.log('Intentando guardar código de verificación:', { email, verificationCode: code, expiresAt });

        // Guarda el código en la base de datos
        const verificationRecord = await Verification.create({
            email: email.trim().toLowerCase(),
            verificationCode: code,
            expiresAt,
        });

        console.log('Código de verificación guardado en la base de datos:', verificationRecord);
        res.status(200).json({ message: 'Código de verificación enviado a tu correo.' });
    } catch (error) {
        console.error('Error al enviar el código:', error);
        res.status(500).json({ message: 'Error al enviar el código', error });
    }
};

// Función para verificar el código de verificación del usuario
const verifyUser = async (req, res) => {
    const { email, verificationCode } = req.body;

    if (!email || !verificationCode) {
        return res.status(400).json({ message: 'Correo electrónico y código requeridos' });
    }

    try {
        const trimmedEmail = email.trim().toLowerCase();
        const trimmedCode = verificationCode.trim();

        console.log('Buscando el registro en la base de datos:', { email: trimmedEmail, code: trimmedCode });

        // Buscar el registro en la base de datos
        const verificationRecord = await Verification.findOne({
            email: trimmedEmail,
            verificationCode: trimmedCode,
        });

        if (!verificationRecord) {
            console.error(`Código o email no encontrado: ${trimmedEmail}, ${trimmedCode}`);
            return res.status(400).json({ message: 'Código incorrecto o no encontrado' });
        }

        // Mostrar mensaje si se encuentra el registro
        console.log('Registro encontrado:', verificationRecord);

        // Verificar si el código ha expirado
        const currentTime = Date.now();
        if (currentTime > new Date(verificationRecord.expiresAt).getTime()) {
            console.error('El código ha expirado:', verificationRecord);
            return res.status(400).json({ message: 'El código ha expirado' });
        }

        console.log('Usuario verificado con éxito:', { email: trimmedEmail });
        res.status(200).json({ message: 'Usuario verificado con éxito' });
    } catch (error) {
        console.error('Error al verificar código:', error);
        res.status(500).json({ message: 'Error interno del servidor', error });
    }
};

module.exports = { sendCode, verifyUser };
