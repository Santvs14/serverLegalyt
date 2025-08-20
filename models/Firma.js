// models/Firma.js

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const FirmaSchema = new Schema({
  firmaDigital: {
    type: String,

  },
  admins: {  // Cambia 'admins' a 'admin'
    type: Schema.Types.ObjectId,
    ref: 'admins',  // Nombre de la colección de administradores

  },
  solicituds: {  // Cambia 'solicituds' a 'solicitud'
    type: Schema.Types.ObjectId,
    ref: 'solicituds',  // Nombre de la colección de solicitudes

  },
  fechaCreacion: {
    type: Date,
    default: Date.now
  }
}, { collection: 'Firma' }); // 👈 fuerza a usar la colección "Firma"


module.exports = mongoose.model('Firma', FirmaSchema);
