// models/Admin.js
const mongoose = require('mongoose');

const AdminSchema = new mongoose.Schema({
    nombre: { type: String, required: true },
    apellido: { type: String, required: true },
    codigo: { type: String, required: true, unique: true },
    departamento: { type: String, required: true },
}, { timestamps: true });

const Admin = mongoose.model('Admin', AdminSchema);
module.exports = Admin;
