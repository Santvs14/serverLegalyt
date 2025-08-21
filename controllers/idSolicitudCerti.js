// controllers/idSolicitudCerti.js
const Solicitud = require('../models/Solicitud');
const Certificacion = require('../models/certificacion');

const obtenerSolicitudYCertificacion = async (solicitudId) => {
    console.log('[idSolicitudCerti] Iniciando búsqueda para solicitudId:', solicitudId);

    try {
        // 1️⃣ Buscar la solicitud
        const solicitud = await Solicitud.findById(solicitudId);
        if (!solicitud) {
            console.log('[idSolicitudCerti] La solicitud no existe');
            return null;
        }
        console.log('[idSolicitudCerti] Solicitud encontrada:', solicitud.nombre, solicitud.apellido);

        // 2️⃣ Buscar la certificación asociada a la solicitud
        const certificacion = await Certificacion.findOne({ solicitudId: solicitud._id });
        if (!certificacion) {
            console.log('[idSolicitudCerti] No se encontró certificación para esta solicitud');
            return { solicitud, certificacion: null };
        }

        console.log('[idSolicitudCerti] Certificación encontrada:', certificacion.archivoCertificado);

        // 3️⃣ Retornar la solicitud y certificación
        return { solicitud, certificacion };
    } catch (error) {
        console.error('[idSolicitudCerti] Error al obtener solicitud o certificación:', error);
        throw error;
    }
};

module.exports = { obtenerSolicitudYCertificacion };
