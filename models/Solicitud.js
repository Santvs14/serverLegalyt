//models/solicitud

const mongoose = require('mongoose');

const SolicitudSchema = new mongoose.Schema({
    nombre: String,
    apellido: String,
    cedula: String,
    email: String,
    universidad: String,
    matricula: String,
    carrera: String,
    telefono: {
        type: String,
        set: (telefono) => `1${telefono.replace(/[-\s]/g, '')}`, // Elimina guiones y agrega prefijo
    },
    estado: {
        type: String,
        enum: ["pendiente", "revisión", "aprobada", "rechazada"],
        default: "pendiente"
    },
    haPagado: String,
    archivos: Array, // Para guardar los nombres de los archivos
    documentos: Array, // Para guardar los documentos subidos
});

const Solicitud = mongoose.model('Solicitud', SolicitudSchema);
module.exports = Solicitud;
