const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin'); // Suponiendo que tienes un modelo de Admin

const router = express.Router();

// Ruta para iniciar sesión
router.post('/login', async (req, res) => {
  const { nombre, codigo } = req.body;

  try {
    // Buscar al administrador en la base de datos por el nombre y el código
    const admin = await Admin.findOne({ nombre, codigo });

    // Si el administrador no existe
    if (!admin) {
      return res.status(400).json({ message: 'Credenciales incorrectas' });
    }

    // Crear un token JWT
    const token = jwt.sign(
      { id: admin._id, nombre: admin.nombre, codigo: admin.codigo },
      'mi_claveAcesso', // Cambiar por una clave secreta más segura
      { expiresIn: '1h' }
    );

    // Enviar el token como respuesta
    res.status(200).json({ token });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error en el servidor' });
  }
});

module.exports = router;
