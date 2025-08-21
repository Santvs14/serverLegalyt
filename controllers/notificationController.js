
 require('dotenv').config();
console.log('API Key-SENDINBLUE:', process.env.SENDINBLUE_API_KEY); // Asegúrate de que la clave se imprime correctamente

const mongoose = require('mongoose');
const ObjectId = mongoose.Types.ObjectId;

const Certificacion = require('../models/certificacion'); // Asegúrate de tener el modelo correcto
const Solicitud = require('../models/Solicitud');
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








// Función para notificar cambios de estado
const notifyStatusChange = async (email, estado, solicitudId) => {
  let subject = 'Actualización de estado de la solicitud';
  let message = '';

  try {
    if (estado === 'aprobado') {
      // Convertimos solicitudId a ObjectId para la búsqueda
      const objSolicitudId = new mongoose.Types.ObjectId(solicitudId);

      // Buscar directamente en la base de datos
      const certificacion = await Certificacion.findOne({ solicitudId: objSolicitudId });

      console.log('Certificación encontrada para enviar por correo:', certificacion);

      if (certificacion && certificacion.archivoCertificado) {
        message = `¡Enhorabuena! Su solicitud ha sido aprobada. Puede descargar su certificado aquí: 
        <a href="${certificacion.archivoCertificado}" target="_blank">Descargar certificado</a>`;
      } else {
        message = `¡Enhorabuena! Su solicitud ha sido aprobada. Puede descargar su certificado aquí: 
        <a href="https://serverlegalyt.onrender.com/public/certificado/certificado_68a75106ca6bbece8cbb4fbf.pdf" 
           download="Certificado_${certificacion.nombre}_${certificacion.apellido}.pdf" 
           style="text-decoration:none;">
           Descargar certificado
        </a>`;
        
      }

    } else {
      // Otros estados
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
          message = 'Su solicitud ha sido rechazada. Para más información contacte nuestras oficinas.';
      }
    }

    await sendEmailNotification(email, subject, message);

  } catch (error) {
    console.error('Error en notifyStatusChange:', error);
  }
};

module.exports = { sendEmailNotification, notifyStatusChange };