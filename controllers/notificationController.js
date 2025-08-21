require('dotenv').config(); // Asegúrate de que esto esté al inicio del archivo
console.log('API Key-SENDINBLUE:', process.env.SENDINBLUE_API_KEY);

const Firma = require('../models/Firma'); 
const Solicitud = require('../models/Solicitud');
const Certificacion = require('../models/certificacion');

// acceder a la autenticación
const SibApiV3Sdk = require('sib-api-v3-sdk');
const defaultClient = SibApiV3Sdk.ApiClient.instance;

// API KEY Sendinblue
const apiKey = defaultClient.authentications['api-key'];
apiKey.apiKey = process.env.SENDINBLUE_API_KEY;

const sendEmailNotification = async (email, subject, message) => {
  const apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();

  const sendSmtpEmail = {
    to: [{ email: email }],
    sender: { email: 'santiagovs1402@gmail.com', name: 'Mescyt' },
    subject: subject,
    htmlContent: `<html><body><p>${message}</p></body></html>`,
  };

  try {
    await apiInstance.sendTransacEmail(sendSmtpEmail);
    console.log('Email enviado exitosamente', sendSmtpEmail);
  } catch (error) {
    console.error('Error al enviar email:', error);
  }
};

/**
 * Notifica el cambio de estado de una solicitud, partiendo del ID de la Firma.
 * @param {String} firmaId - ID de la Firma en MongoDB
 * @param {String} estado - Estado nuevo de la solicitud
 */
const notifyStatusChange = async (firmaId, estado) => {
  let subject = 'Actualización de estado de la solicitud';
  let message = '';

  try {
    // 1. Buscar la firma y popular la solicitud
    const firma = await Firma.findById(firmaId).populate('solicitud');
    if (!firma) {
      console.log('No se encontró la firma con ese ID');
      return;
    }

    const solicitud = firma.solicituds;
    if (!solicitud) {
      console.log('No se encontró la solicitud vinculada a esta firma');
      return;
    }

    console.log(`Solicitud encontrada: ${solicitud.nombre} ${solicitud.apellido} ${solicitud._id}`);

    // 2. Buscar la certificación vinculada a la solicitud
    const certificacion = await Certificacion.findOne({ solicitudId: solicitud._id }).lean();

    if (estado === 'aprobado') {
      if (certificacion && certificacion.archivoCertificado) {
        message = `¡Enhorabuena! Su solicitud ha sido aprobada. Aquí tiene anexada la certificación, lo cual cuenta como un documento válido para su posterior uso.</br></br>
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
          message = 'Su solicitud ha sido rechazada.</br> Para saber los motivos visite nuestras oficinas o contacte vía teléfono: (809) 731 1100  | Fax: 809-731-1101 | Horario: De 8:00 a.m. a 4:00 p.m. de Lunes a Viernes.';
          break;
      }
    }

    // 3. Enviar la notificación al correo de la solicitud
    await sendEmailNotification(solicitud.email, subject, message);
  } catch (error) {
    console.error('Error en notifyStatusChange:', error);
  }
};

module.exports = { sendEmailNotification, notifyStatusChange };
