//Configurar rutas 

// routes/tituloRoutes.js
const express = require('express');
const router = express.Router();
const Titulo = require('../models/tituloModel'); // Asegúrate de que la ruta sea correcta

// Ruta para obtener todos los títulos
router.get('/', async (req, res) => {
    try {
        const titulos = await Titulo.find();
        res.json(titulos);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});


// Ruta para crear un nuevo título
router.post('/', async (req, res) => {
    const { numero_titulo, nombre, apellido, ubicacion, carrera, fecha_investidura, universidad, fecha_registro } = req.body; // Incluye universidad

    const titulo = new Titulo({
        numero_titulo,       // Añade el campo número de título
        nombre,              // Campo nombre
        apellido,            // Campo apellido
        ubicacion,           // Campo ubicación
        carrera,             // Campo carrera
        fecha_investidura,   // Campo fecha de investidura
        universidad,         // Campo universidad
        fecha_registro       // Campo fecha de registro
    });

    try {
        const nuevoTitulo = await titulo.save();
        res.status(201).json(nuevoTitulo);
        console.log('Nuevo titulo')
    } catch (err) {
        res.status(400).json({ message: err.message });
        console.log('Error con el nuevo titulo')
    }
});







module.exports = router;
