require('dotenv').config(); // Asegúrate de que esto esté al inicio del archivo
console.log('API Key-SENDINBLUE:', process.env.SENDINBLUE_API_KEY); // Verifica la clave

const Solicitud = require('../models/Solicitud');
const Certificacion = require('../models/certificacion');
const Firma = require('../models/Firma');

const SibApiV3Sdk = require('sib-api-v3-sdk');
const defaultClient = SibApiV3Sdk.ApiClient.instance;
const apiKey = defaultClient.authentications['api-key'];
apiKey.apiKey = process.env.SENDINBLUE_API_KEY;

// Función para enviar correos
const sendEmailNotification = async (email, subject, message) => {
  const apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();

  const sendSmtpEmail = {
    to: [{ email }],
    sender: { email: 'santiagovs1402@gmail.com', name: 'Mescyt' },
    subject,
    htmlContent: `<html><body><p>${message}</p></body></html>`,
  };

  try {
    await apiInstance.sendTransacEmail(sendSmtpEmail);
    console.log('Email enviado exitosamente:', sendSmtpEmail);
  } catch (error) {
    console.error('Error al enviar email:', error);
  }
};

// Función principal de notificación
const notifyStatusChange = async (solicitudId, estado) => {
  if (!solicitudId) {
    console.error('Error: solicitudId es undefined');
    return;
  }

  console.log(`[Notify] Iniciando notificación para solicitudId: ${solicitudId}, estado: ${estado}`);

  try {
    // 1. Buscar la solicitud en la base de datos
    const solicitud = await Solicitud.findById(solicitudId);
    if (!solicitud) {
      console.log('[Notify] La solicitud no existe');
      return;
    }
    console.log(`Solicitud encontrada: ${solicitud.nombre} ${solicitud.apellido}`);

    // 2. Buscar la certificación asociada a esta solicitud
    const certificacion = await Certificacion.findOne({ solicitudId: solicitud._id });
    console.log('Certificación encontrada:', certificacion);

    // 3. Preparar mensaje según el estado
    let subject = 'Actualización de estado de la solicitud';
    let message = '';

    if (estado === 'aprobado') {
      if (certificacion && certificacion.archivoCertificado) {
        message = `¡Enhorabuena, ${solicitud.nombre} ${solicitud.apellido}! Su solicitud ha sido aprobada. Aqui tiene anexada la certificación, lo cual cuenta como un documento válido para su posterior uso. </br></br>Puede descargar su certificado aquí: <a href="${certificacion.archivoCertificado}" target="_blank">Descargar certificado</a>`;
      } else {
        message = `¡Enhorabuena, ${solicitud.nombre} ${solicitud.apellido}! Su solicitud ha sido aprobada. El archivo del certificado no está disponible.`;
      }
    } else {
      switch (estado) {
        case 'pendiente':
          message = `Hola ${solicitud.nombre}, su solicitud ha sido recibida y está pendiente de revisión.`;
          break;
        case 'revisión':
          message = `Hola ${solicitud.nombre}, su solicitud está actualmente en revisión.`;
          break;
        case 'verificado':
          message = `Hola ${solicitud.nombre}, su solicitud ha sido verificada con éxito.`;
          break;
        case 'rechazado':
        default:
          message = `Hola ${solicitud.nombre}, su solicitud ha sido rechazada, </br> para saber los motivos visite nuestras oficinas o contacte vía teléfono: (809) 731 1100  | Fax: 809-731-1101 | Horario:De 8:00 a.m. a 4:00 p.m. de Lunes a Viernes.`;
          break;
      }
    }

    // 4. Enviar correo
    await sendEmailNotification(solicitud.email, subject, message);
    console.log('[Notify] Notificación enviada correctamente');

  } catch (error) {
    console.error('[Notify] Error durante la notificación:', error);
  }
};

module.exports = { sendEmailNotification, notifyStatusChange };
