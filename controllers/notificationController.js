require('dotenv').config();
console.log('API Key-SENDINBLUE:', process.env.SENDINBLUE_API_KEY);

const Solicitud = require('../models/Solicitud');
const Firma = require('../models/Firma');
const Certificacion = require('../models/certificacion');

const SibApiV3Sdk = require('sib-api-v3-sdk');
const defaultClient = SibApiV3Sdk.ApiClient.instance;
const apiKey = defaultClient.authentications['api-key'];
apiKey.apiKey = process.env.SENDINBLUE_API_KEY;

/**
 * Enviar correo
 */
const sendEmailNotification = async (email, subject, message) => {
  const apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();
  const sendSmtpEmail = {
    to: [{ email }],
    sender: { email: 'santiagovs1402@gmail.com', name: 'Mescyt' },
    subject,
    htmlContent: `<html><body>${message}</body></html>`,
  };

  try {
    console.log(`[Email] Enviando correo a: ${email}`);
    await apiInstance.sendTransacEmail(sendSmtpEmail);
    console.log('[Email] Correo enviado exitosamente');
  } catch (error) {
    console.error('[Email] Error al enviar correo:', error);
  }
};

/**
 * Notificación de cambio de estado
 * @param {String} identifier Puede ser email o ObjectId de solicitud
 * @param {String} estado Estado de la solicitud
 */
const notifyStatusChange = async (identifier, estado) => {
  console.log(`[Notify] Iniciando notificación para identifier: ${identifier}, estado: ${estado}`);

  try {
    // Detectar si el identifier es ObjectId o email
    let solicitud;
    if (mongoose.Types.ObjectId.isValid(identifier)) {
      solicitud = await Solicitud.findById(identifier);
    } else {
      solicitud = await Solicitud.findOne({ email: identifier });
    }

    if (!solicitud) {
      console.log('[Notify] La solicitud no existe para este identificador');
      return;
    }

    console.log(`[Notify] Solicitud encontrada: ${solicitud.nombre} ${solicitud.apellido}, id: ${solicitud._id}, email: ${solicitud.email}`);

    // Buscar la firma
    const firma = await Firma.findOne({ solicituds: solicitud._id }).populate('admins');
    console.log('[Notify] Firma encontrada:', firma?._id || 'No existe');

    // Buscar certificación si estado es 'aprobado'
    let message = '';
    if (estado === 'aprobado') {
      const certificacion = await Certificacion.findOne({ solicitudId: solicitud._id });
      console.log('[Notify] Certificación encontrada:', certificacion?._id || 'No existe');

      if (certificacion && certificacion.archivoCertificado) {
        message = `¡Enhorabuena! Su solicitud ha sido aprobada.<br>
        Puede descargar su certificado aquí: <a href="${certificacion.archivoCertificado}" target="_blank">Descargar certificado</a>`;
      } else {
        message = '¡Enhorabuena! Su solicitud ha sido aprobada. El archivo del certificado no está disponible.';
      }
    } else {
      switch (estado) {
        case 'pendiente':
          message = 'Su solicitud ha sido recibida y está pendiente de revisión.';
          break;
        case 'revisión':
          message = 'Su solicitud está actualmente en revisión.';
          break;
        case 'verificado':
          message = 'Su solicitud ha sido verificada con éxito.';
          break;
        case 'rechazado':
        default:
          message = 'Su solicitud ha sido rechazada. Para más información contacte nuestras oficinas o vía teléfono.';
      }
    }

    // Enviar correo
    await sendEmailNotification(solicitud.email, 'Actualización de estado de la solicitud', message);
    console.log('[Notify] Proceso de notificación finalizado');

  } catch (error) {
    console.error('[Notify] Error durante la notificación:', error);
  }
};

module.exports = { sendEmailNotification, notifyStatusChange };
