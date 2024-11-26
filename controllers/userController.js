const express = require('express');

const Verification = require('../models/Verification');  // Modelo para almacenar códigos de verificación
const sendVerificationEmail = require('../utils/sendVerifyEmail');  // Ruta del archivo de verificación (actualízalo si es necesario)

// Función para enviar el código de verificación al correo electrónico
const sendCode = async (req, res) => {
    const { email } = req.body;

    if (!email) {
        return res.status(400).json({ message: 'Correo electrónico es obligatorio' });
    }

    try {
        // Generar código y fecha de expiración de manera correcta
        const { code, expiresAt } = await sendVerificationEmail(email);  // Usa `await` aquí para esperar la resolución

        console.log('Intentando guardar código de verificación:', { email, verificationCode: code, expiresAt });

        // Guarda el código en la base de datos
        const verificationRecord = await Verification.create({
            email: email.trim().toLowerCase(),
            verificationCode: code.trim(),
            expiresAt,
        });

        console.log('Código de verificación guardado:', verificationRecord);
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
        console.error('Faltan datos en la solicitud:', req.body);
        return res.status(400).json({ message: 'Correo electrónico y código requeridos' });
    }

    try {
        console.log('Datos recibidos en verifyUser:', req.body);

        // Buscar el registro en la base de datos
        const verificationRecord = await Verification.findOne({
            email: email.trim().toLowerCase(),
            verificationCode: verificationCode.trim(),
        });

        console.log('Registro encontrado en la base de datos:', verificationRecord);

        if (!verificationRecord) {
            console.error('Código de verificación no encontrado:', { email, verificationCode });
            return res.status(400).json({ message: 'Código incorrecto o no encontrado' });
        }

        // Verificar si el código ha expirado
        if (new Date(verificationRecord.expiresAt) < new Date()) {
            console.error('Código expirado:', verificationRecord.expiresAt);
            return res.status(400).json({ message: 'El código ha expirado' });
        }

        res.status(200).json({ message: 'Usuario verificado con éxito' });
    } catch (error) {
        console.error('Error al verificar el usuario:', error);
        res.status(500).json({ message: 'Error interno del servidor', error: error.message });
    }
};



module.exports = { sendCode, verifyUser };
