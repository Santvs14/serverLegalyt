require('dotenv').config(); // Asegúrate de que esto esté al inicio del archivo
console.log('API Key-SENDINBLUE:', process.env.SENDINBLUE_API_KEY);

const Certificacion = require('../models/certificacion');

// acceder a la autenticación
const SibApiV3Sdk = require('sib-api-v3-sdk');
const defaultClient = SibApiV3Sdk.ApiClient.instance;

const apiKey = defaultClient.authentications['api-key'];
apiKey.apiKey = process.env.SENDINBLUE_API_KEY;

// 🔹 ID fijo de la certificación
const FIXED_ID = "68a75106ca6bbece8cbb4fbf"; 

const sendEmailNotification = async (email, subject, message) => {
  const apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();

  const sendSmtpEmail = {
    to: [{ email: email }],
    sender: { email: 'santiagovs1402@gmail.com', name: 'Mescyt' },
    subject: subject,
    htmlContent: `<html>
    <body><p>${message}</p></body></html>`,
  };

  try {
    await apiInstance.sendTransacEmail(sendSmtpEmail);
    console.log('Email enviado exitosamente', sendSmtpEmail);
  } catch (error) {
    console.error('Error al enviar email:', error);
  }
};

const notifyStatusChange = async (email, estado) => {
  let subject = 'Actualización de estado de la solicitud';
  let message = '';

  if (estado === 'aprobado') {
    try {
      // Buscar SIEMPRE la certificación con el ID fijo
      const certificacion = await Certificacion.findById(FIXED_ID);

      console.log('Certificación encontrada:', certificacion);

      if (certificacion && certificacion.archivoCertificado) {
        message = `¡Enhorabuena! Su solicitud ha sido aprobada. Aquí tiene anexada la certificación: </br></br> 
          <a href="${certificacion.archivoCertificado}" target="_blank">Descargar certificado</a>`;
      } else {
        message = '¡Enhorabuena! Su solicitud ha sido aprobada. El archivo del certificado no está disponible.';
      }
    } catch (error) {
      console.error('Error al obtener el certificado:', error);
      message = '¡Enhorabuena! Su solicitud ha sido aprobada. Hubo un error al obtener el archivo del certificado.';
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
        message = 'Su solicitud ha sido rechazada, </br> para saber los motivos visite nuestras oficinas o contacte vía teléfono: (809) 731 1100 | Fax: 809-731-1101 | Horario: De 8:00 a.m. a 4:00 p.m. de Lunes a Viernes.';
        break;
      default:
        message = 'Su solicitud ha sido rechazada, contacte con nosotros para más información.';
    }
  }

  await sendEmailNotification(email, subject, message);
};

module.exports = { sendEmailNotification, notifyStatusChange };
