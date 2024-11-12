//controller/SolicitudController



const Solicitud = require('../models/Solicitud'); // Asegúrate de tener este modelo
const User = require('../models/User');
const express = require('express');
const router = express.Router();

const { enviarNotificacionSMS } = require('./notificationController'); // Importa la función para enviar SMS

// Ruta para obtener todas las solicitudes
const getSolicitudes = async (req, res) => {
    try {
        const solicitudes = await Solicitud.find(); // Obtener todas las solicitudes
        res.json(solicitudes);
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener las solicitudes' });
    }
};

// Función para actualizar el estado de la solicitud
// Función para actualizar el estado de la solicitud
// Función para actualizar el estado de la solicitud
const actualizarEstadoSolicitud = async (req, res) => {
    const { solicitudId } = req.params;
    const { estado } = req.body;

    try {
        const estadosValidos = ['aprobada', 'rechazada', 'pendiente', 'revisión', 'verificado'];
        if (!estadosValidos.includes(estado)) {
            return res.status(400).json({ message: 'Estado no válido' });
        }

        const solicitud = await Solicitud.findById(solicitudId);
        if (!solicitud) {
            return res.status(404).json({ message: 'Solicitud no encontrada' });
        }

        const usuario = await User.findOne({ nombre: solicitud.nombre, apellido: solicitud.apellido });
        if (!usuario || !usuario.telefono) {
            return res.status(404).json({ message: 'Número de teléfono no encontrado para el usuario' });
        }

        solicitud.estado = estado;
        await solicitud.save();

        let mensaje = `Tu solicitud ha cambiado a ${estado}.`;
        const telefonoUsuario = `+${usuario.telefono}`;
        await enviarNotificacionSMS(telefonoUsuario, mensaje);

        res.status(200).json({ message: `Estado actualizado a ${estado} y SMS enviado.` });
    } catch (error) {
        console.error('Error al actualizar la solicitud:', error);
        res.status(500).json({ message: 'Error al actualizar el estado' });
    }
};


// Define las rutas en el router
router.put('/solicitud/:solicitudId/estado', actualizarEstadoSolicitud);
router.get('/requests', getSolicitudes); // Asegúrate de tener esta ruta

// Exportar las funciones y el router
module.exports = {
    getSolicitudes,
    actualizarEstadoSolicitud,
    router, // Exporta el router
};
