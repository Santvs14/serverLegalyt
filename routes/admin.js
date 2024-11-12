// routes/admin.js
const express = require('express');
const Admin = require('../models/Admin');
const router = express.Router();

// Registro de administrador
router.post('/register', async (req, res) => {
    const { nombre, apellido, codigo, departamento } = req.body;

    try {
        const newAdmin = new Admin({ nombre, apellido, codigo, departamento });
        await newAdmin.save();
        res.status(201).json({ message: 'Administrador registrado con éxito' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Aquí puedes agregar más rutas para la funcionalidad del administrador

module.exports = router;
