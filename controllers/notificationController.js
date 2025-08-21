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
 * Función para enviar correo
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
 * Función para notificar cambios de estado de la solicitud
 */
const notifyStatusChange = async (solicitudId, estado) => {
  console.log(`[Notify] Iniciando notificación para solicitudId: ${solicitudId}, estado: ${estado}`);

  let subject = 'Actualización de estado de la solicitud';
  let message = '';

  try {
    // 1️⃣ Buscar la solicitud en la base de datos
    const solicitud = await Solicitud.findById(solicitudId);
    if (!solicitud) {
      console.log('[Notify] La solicitud no existe');
      return;
    }
    console.log(`[Notify] Solicitud encontrada: ${solicitud.nombre} ${solicitud.apellido}, email: ${solicitud.email}`);

    // 2️⃣ Buscar la firma asociada a la solicitud
    const firma = await Firma.findOne({ solicituds: solicitudId }).populate('admins');
    if (!firma) {
      console.log('[Notify] La firma no existe para esta solicitud');
    } else {
      console.log('[Notify] Firma encontrada:', firma._id);
    }

    // 3️⃣ Obtener certificación si el estado es 'aprobado'
    if (estado === 'aprobado') {
      const certificacion = await Certificacion.findOne({ solicitudId });
      console.log('[Notify] Certificación encontrada:', certificacion?._id || 'No disponible');

      if (certificacion && certificacion.archivoCertificado) {
        message = `¡Enhorabuena! Su solicitud ha sido aprobada. Aquí tiene anexada la certificación, lo cual cuenta como un documento válido para su posterior uso.<br><br>
        Puede descargar su certificado aquí: <a href="${certificacion.archivoCertificado}" target="_blank">Descargar certificado</a>`;
      } else {
        message = '¡Enhorabuena! Su solicitud ha sido aprobada. El archivo del certificado no está disponible.';
      }
    } else {
      // Mensajes estándar para otros estados
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
          message = 'Su solicitud ha sido rechazada. Para más información visite nuestras oficinas o contacte vía teléfono: (809) 731 1100 | Fax: 809-731-1101 | Horario: 8:00 a.m. - 4:00 p.m. de lunes a viernes.';
      }
    }

    // 4️⃣ Enviar correo al email de la solicitud
    await sendEmailNotification(solicitud.email, subject, message);
    console.log('[Notify] Proceso de notificación finalizado');

  } catch (error) {
    console.error('[Notify] Error durante la notificación:', error);
  }
};

module.exports = { sendEmailNotification, notifyStatusChange };
