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
const notifyStatusChange = async (solicitudIdOrEmail, estado) => {
  let solicitud;

  // Detectamos si es un ObjectId válido
  if (/^[0-9a-fA-F]{24}$/.test(solicitudIdOrEmail)) {
    solicitud = await Solicitud.findById(solicitudIdOrEmail);
  } else {
    // Si no es un ObjectId, asumimos que es el email
    solicitud = await Solicitud.findOne({ email: solicitudIdOrEmail });
  }

  if (!solicitud) {
    console.log('[Notify] La solicitud no existe');
    return;
  }

  console.log(`Solicitud encontrada: ${solicitud.nombre} ${solicitud.apellido}`);

  const certificacion = await Certificacion.findOne({ solicitudId: solicitud._id });
  console.log('Certificación encontrada:', certificacion);

  let subject = 'Actualización de estado de la solicitud';
  let message = '';

  if (estado === 'aprobado') {
    if (certificacion && certificacion.archivoCertificado) {
      message = `¡Enhorabuena, ${solicitud.nombre} ${solicitud.apellido}! Su solicitud ha sido aprobada. Puede descargar su certificado aquí: <a href="${certificacion.archivoCertificado}" target="_blank">Descargar certificado</a>`;
    } else {
      message = `¡Enhorabuena, ${solicitud.nombre} ${solicitud.apellido}! Su solicitud ha sido aprobada. El archivo del certificado no está disponible.`;
    }
  } else {
    // Otros estados
    message = `Hola ${solicitud.nombre}, su solicitud está en estado: ${estado}.`;
  }

  await sendEmailNotification(solicitud.email, subject, message);
};
