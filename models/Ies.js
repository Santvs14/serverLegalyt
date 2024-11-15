const mongoose = require('mongoose');

const IESSchema = new mongoose.Schema({
  nombres: {
    type: String,
    required: true,
    trim: true,
  },
  apellidos: {
    type: String,
    required: true,
    trim: true,
  },
  carrera: {
    type: String,
    required: true,
    trim: true,
  },
  matricula: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  documentos: [
    {
      type: String, // Almacena URLs de los documentos subidos
      required: true,
    },
  ],
}, { timestamps: true });

module.exports = mongoose.model('IES', IESSchema);
