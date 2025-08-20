
const User = require('../models/userModel');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Registro de usuarios (solo administradores)
exports.registerUser = async (req, res) => {
    const { username, password, role } = req.body;
    
    // Verifica si el rol del usuario actual es admin
    if (req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Acceso denegado' });
    }
    
    try {
        const user = new User({ username, password, role });
        await user.save();
        res.status(201).json({ message: 'Usuario creado exitosamente' });
    } catch (error) {
        res.status(500).json({ message: 'Error al registrar usuario' });
    }
};

// Inicio de sesión
// Inicio de sesión
exports.login = async (req, res) => {
    const { username, password } = req.body;
    
    try {
        const user = await User.findOne({ username });
        if (!user) return res.status(400).json({ message: 'Usuario no encontrado' });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ message: 'Contraseña incorrecta' });

        const token = jwt.sign(
            { id: user._id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );

        // 👇 aquí enviamos todo lo necesario al frontend
        res.json({
            token,
            adminId: user._id,
            username: user.username,
            role: user.role
        });
    } catch (error) {
        res.status(500).json({ message: 'Error al iniciar sesión' });
    }
};
