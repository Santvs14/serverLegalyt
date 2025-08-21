
require('dotenv').config(); // Asegúrate de que esto esté al inicio del archivo
console.log('API Key-SENDINBLUE:', process.env.SENDINBLUE_API_KEY); // Asegúrate de que la clave se imprime correctamente


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








const notifyStatusChange = async (email, estado) => {
  let subject = 'Actualización de estado de la solicitud';
  let message = '';

  try {
    // Buscar la certificación asociada al email
    const certificacion = await Certificacion.findOne({ email: email });

    if (certificacion) {
      console.log(`Generando certificado para la solicitud: ${certificacion.solicitudId}`);
    } else {
      console.log('No se encontró certificación para este email');
    }

    if (estado === 'aprobado') {
      if (certificacion && certificacion.archivoCertificado) {
        message = `¡Enhorabuena! Su solicitud ha sido aprobada. Puede descargar su certificado aquí: <a href="${certificacion.archivoCertificado}" target="_blank">Descargar certificado</a>`;
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
          message = 'Su solicitud ha sido rechazada, para más información contacte nuestras oficinas.';
          break;
      }
    }

    await sendEmailNotification(email, subject, message);
  } catch (error) {
    console.error('Error al obtener la certificación o enviar el correo:', error);
  }
};

module.exports = { sendEmailNotification, notifyStatusChange };