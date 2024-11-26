const express = require('express');
const Verification = require('../models/Verification'); // Modelo para almacenar códigos de verificación
const sendVerificationEmail = require('../utils/sendVerifyEmail'); // Función para enviar email

// Función para enviar y guardar el código de verificación
const sendCode = async (req, res) => {
    const { email } = req.body;

    if (!email) {
        console.error('Correo electrónico no proporcionado en la solicitud.');
        return res.status(400).json({ message: 'Correo electrónico es obligatorio' });
    }

    try {
        const trimmedEmail = email.trim().toLowerCase();

        // Generar un código de verificación y su fecha de expiración
        const code = Math.floor(100000 + Math.random() * 900000).toString(); // Código de 6 dígitos
        const expiresAt = new Date(Date.now() + 3 * 60 * 1000); // Expira en 3 minutos

        // Guardar el código en la base de datos
        console.log('Intentando guardar el código en la base de datos:', { email: trimmedEmail, code, expiresAt });

        const verificationRecord = await Verification.create({
            email: trimmedEmail,
            verificationCode: code,
            expiresAt,
        });

        if (verificationRecord) {
            console.log('Código guardado en la base de datos con éxito:', verificationRecord);
        } else {
            console.error('No se pudo guardar el código en la base de datos.');
            return res.status(500).json({ message: 'Error al guardar el código en la base de datos.' });
        }

        // Enviar el código por correo
        console.log('Intentando enviar el código por correo electrónico...');
        await sendVerificationEmail(trimmedEmail, code);

        console.log('Código enviado exitosamente al correo:', trimmedEmail);
        res.status(200).json({ message: 'Código de verificación enviado a tu correo.' });
    } catch (error) {
        console.error('Error al enviar el código:', error);
        res.status(500).json({ message: 'Error al enviar el código', error });
    }
};

// Función para verificar el código de verificación
const verifyUser = async (req, res) => {
    const { email, verificationCode } = req.body;

    if (!email || !verificationCode) {
        console.error('Correo electrónico o código no proporcionados:', { email, verificationCode });
        return res.status(400).json({ message: 'Correo electrónico y código requeridos' });
    }

    try {
        const trimmedEmail = email.trim().toLowerCase();
        const trimmedCode = verificationCode.trim();

        console.log('Buscando el registro en la base de datos:', { email: trimmedEmail, code: trimmedCode });

        // Buscar el código en la base de datos
        const verificationRecord = await Verification.findOne({
            email: trimmedEmail,
            verificationCode: trimmedCode,
        });

        if (!verificationRecord) {
            console.error(`Código o email no encontrado: ${trimmedEmail}, ${trimmedCode}`);
            return res.status(400).json({ message: 'Código incorrecto o no encontrado' });
        }

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
