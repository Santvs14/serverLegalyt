//lógica para manejar las operaciones relacionadas con los títulos, como crear, leer, 
//actualizar y eliminar (CRUD). Aquí tienes un ejemplo básico de cómo podrías estructurarlo.

const Titulo = require('../models/tituloModel'); // Importa el modelo de título

// Obtener todos los títulos
exports.getTitulos = async (req, res) => {
    try {
        const titulos = await Titulo.find(); // Obtener todos los títulos desde la base de datos
        res.status(200).json(titulos); // Responde con los títulos en formato JSON
    } catch (error) {
        res.status(500).json({ message: error.message }); // Manejo de errores
    }
};

// Crear un nuevo título
exports.createTitulo = async (req, res) => {
    const titulo = new Titulo({
        numero_titulo: req.body.numero_titulo,
        nombre: req.body.nombre,
        apellido: req.body.apellido,
        ubicacion: req.body.ubicacion,
        carrera: req.body.carrera,
        fecha_investidura: req.body.fecha_investidura,
        universidad: req.body.universidad,
        fecha_registro: req.body.fecha_registro,
        // Agrega otros campos según sea necesario
    });

    try {
        const nuevoTitulo = await titulo.save(); // Guardar el nuevo título en la base de datos
        res.status(201).json(nuevoTitulo); // Responde con el título creado
    } catch (error) {
        res.status(400).json({ message: error.message }); // Manejo de errores
    }
};



// Puedes agregar más funciones aquí para actualizar y eliminar títulos
