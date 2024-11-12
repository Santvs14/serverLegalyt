//Define un esquema de Mongoose para los títulos y exporta el modelo.

// models/tituloModel.js
const mongoose = require('mongoose');

const tituloSchema = new mongoose.Schema({
    numero_titulo: { type: String, required: true },
    nombre: { type: String, required: true },
    apellido: { type: String, required: true },
    ubicacion: { type: String, required: true },
    carrera: { type: String, required: true },
    fecha_investidura: { type: Date, required: true },
    universidad: { type: String, required: true },
    fecha_registro: { type: Date, required: true },
});

module.exports = mongoose.model('Titulo', tituloSchema);
