const mongoose = require('mongoose');

const certificacionSchema = new mongoose.Schema({
    solicitudId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Solicitud',
        required: true},
    nombre: {
        type: String,
        required: true },
    apellido: {
        type: String,
        required: true},
    carrera: {
        type: String,
        required: true },
    universidad: {
        type: String,
        required: true },
    fechaLegalizacion: {
        type: Date,
        default: Date.now},
    archivoCertificado: {
        type: String, // almacenar el enlace al archivo PDF generado
        required: true }
});

const Certificacion = mongoose.model('Certificacion', certificacionSchema);

module.exports = Certificacion;

