
require('dotenv').config(); // Asegúrate de que esto esté al inicio del archivo
console.log('API Key-SENDINBLUE:', process.env.SENDINBLUE_API_KEY); // Asegúrate de que la clave se imprime correctamente
const mongoose = require('mongoose');
const Solicitud = require('../models/Solicitud'); 
const Firma = require('../models/Firma');  
const Certificacion = require('../models/certificacion'); 


const Certificacion = require('../models/certificacion'); // Asegúrate de tener el modelo correcto

//acceder a la autenticación
const SibApiV3Sdk = require('sib-api-v3-sdk');
const defaultClient = SibApiV3Sdk.ApiClient.instance;

// Asegúrate de que el nombre de la autenticación sea correcto
const apiKey = defaultClient.authentications['api-key'];
apiKey.apiKey = process.env.SENDINBLUE_API_KEY; // Asegúrate de tener tu clave de API en tus variables de entorno


const sendEmailNotification = async (email, subject, message) => {
  const apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();

  const sendSmtpEmail = {
    to: [{ email: email }],
    sender: { email: 'santiagovs1402@gmail.com', name: 'Mescyt' },
    subject: subject,
    htmlContent: `<html>
    <body><p>${message} </p>


    </body></html>`,
  };

  try {
    await apiInstance.sendTransacEmail(sendSmtpEmail);
    console.log('Email enviado exitosamente', sendSmtpEmail);
  } catch (error) {
    console.error('Error al enviar email:', error);
  }
};








const notifyStatusChange = async (email, estado, solicitudId) => {
  console.log(`[Notify] Iniciando notificación para solicitudId: ${solicitudId}, estado: ${estado}`);
  let subject = 'Actualización de estado de la solicitud';
  let message = '';

  try {
    // 1. Buscar la solicitud en la base de datos
    const solicitud = await Solicitud.findById(solicitudId);
    if (!solicitud) {
      console.log('[Notify] La solicitud no existe');
      return;
    }
    console.log(`[Notify] Solicitud encontrada: ${solicitud.nombre} ${solicitud.apellido}, email: ${solicitud.email}`);

    // 2. Buscar la certificación usando el _id de la solicitud
    const certificacion = await Certificacion.findOne({ solicitudId: solicitud._id });
    console.log('[Notify] Certificación encontrada:', certificacion ? certificacion._id : 'No existe');

    // 3. Lógica de mensajes según estado
    if (estado === 'aprobado') {
      if (certificacion && certificacion.archivoCertificado) {
        message = `¡Enhorabuena ${solicitud.nombre} ${solicitud.apellido}! Su solicitud ha sido aprobada. 
        Aqui tiene anexada la certificación, lo cual cuenta como un documento válido para su posterior uso.<br><br>
        Puede descargar su certificado aquí: <a href="${certificacion.archivoCertificado}" target="_blank">Descargar certificado</a>`;
      } else {
        message = `¡Enhorabuena ${solicitud.nombre} ${solicitud.apellido}! Su solicitud ha sido aprobada. 
        El archivo del certificado no está disponible.`;
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
          message = 'Su solicitud ha sido rechazada, para saber los motivos visite nuestras oficinas o contacte vía teléfono: (809) 731 1100.';
      }
    }

    // 4. Enviar la notificación por correo
    await sendEmailNotification(email, subject, message);
    console.log('[Notify] Proceso de notificación finalizado');

  } catch (error) {
    console.error('[Notify] Error durante la notificación:', error);
  }
};

module.exports = { sendEmailNotification, notifyStatusChange };