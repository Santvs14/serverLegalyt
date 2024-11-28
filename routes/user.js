
// routes/user.js
const express = require('express');
const bcrypt = require('bcryptjs');

const User = require('../models/User');
const router = express.Router();

// Registro
// Ruta para registrar usuario

router.post('/register', async (req, res) => {
    const { nombre, apellido, cedula, email, carrera, matricula, universidad, contraseña,telefono } = req.body;

      

    try {
        // Validación  de contraseña segura
        const contraseñaSegura = /^(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>])[a-zA-Z\d!@#$%^&*(),.?":{}|<>]{5,}$/;

        if (!contraseñaSegura.test(contraseña)) {
            return res.status(400).json({
                message: 'La contraseña debe tener al menos 5 caracteres, incluir un número y un carácter especial.',
            });
        }

        // Verificar si el usuario ya existe
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'El usuario ya está registrado' });
        }

        // Encripta la contraseña
        const hashedPassword = await bcrypt.hash(contraseña, 10);

        // Crear el nuevo usuario
        const newUser = new User({
            nombre,
            apellido,
            cedula,
            email,
            carrera,
            matricula,
            universidad,
            contraseña: hashedPassword,
            telefono,
        });

        // Guarda el nuevo usuario en la base de datos
        await newUser.save();

        res.status(201).json({ message: 'Usuario registrado con éxito' });
        console.log('Registro exitoso.');
    } catch (error) {
        res.status(500).json({ error: error.message });
        console.log('Error al registrar usuario.');
    }
});


// Aquí puedes agregar la ruta para el inicio de sesión
router.post('/login', async (req, res) => {
    const { cedula, contraseña } = req.body;

    try {
        const user = await User.findOne({ cedula });
        if (!user) return res.status(404).json({ message: 'Credenciales incorrectas' });

        const isMatch = await bcrypt.compare(contraseña, user.contraseña);
        if (!isMatch) return res.status(400).json({ message: 'Contraseña incorrecta' });

        res.status(200).json({ message: 'Inicio de sesión exitoso', user });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
