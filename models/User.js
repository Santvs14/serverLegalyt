

// models/User.js
const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    nombre: { type: String, required: true },
    apellido: { type: String, required: true },
    cedula: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    carrera: { type: String, required: true },
    matricula: { type: String, required: true },
    universidad: { type: String, required: true },
    contraseña: { type: String, required: true },
    telefono: { type: String, required: true }, // Agregando el campo para el número de teléfono
    isVerified: { type: Boolean, default: false }  // Asegúrate de tener este campo


}, { timestamps: true });
UserSchema.pre('save', function (next) {
    // Eliminar guiones y agregar prefijo si no existe
    this.telefono = this.telefono.replace(/[-\s]/g, ''); // Elimina guiones
    if (!this.telefono.startsWith('1')) {
        this.telefono = `1${this.telefono}`;
    }
    next();
});

const User = mongoose.model('User', UserSchema);
module.exports = User;




// Encriptar contraseña antes de guardar
//userSchema.pre('save', async function (next) {
    //if (!this.isModified('password')) return next();
   // const salt = await bcrypt.genSalt(10);
   // this.password = await bcrypt.hash(this.password, salt);
  //  next();
//});

