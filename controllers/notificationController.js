
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








const notifyStatusChange = async (email, estado, _id) => {
  let subject = 'Actualización de estado de la solicitud';
  let message = '';

  // Primero, obtenemos el archivoCertificado si el estado es 'aprobado'
  if (estado === 'aprobado') {
    try {
      // Buscar el archivoCertificado en la colección Certificacion por solicitudId
      const certificacion = await Certificacion.findById(_id);


      // Verifica lo que devuelve la consulta
      console.log('Certificación encontrada:', certificacion);

      // Si existe un archivoCertificado, lo incluimos en el mensaje
      if (certificacion && certificacion.archivoCertificado) {
        message = `¡Enhorabuena! Su solicitud ha sido aprobada. Aqui tiene anexada la certificación, lo cual cuenta como un documento válido para su posterior uso. </br></br>Puede descargar su certificado aquí: <a href="${certificacion.archivoCertificado}" target="_blank">Descargar certificado</a>`;
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
        message = 'Su solicitud ha sido rechazada, </br> para saber los motivos visite nuestras oficinas o contacte vía teléfono: (809) 731 1100  | Fax: 809-731-1101 | Horario:De 8:00 a.m. a 4:00 p.m. de Lunes a Viernes.';
        break;
      default:
        message = 'Su solicitud ha sido rechazada, </br> para saber los motivos visite nuestras oficinas o contacte vía teléfono: (809) 731 1100  | Fax: 809-731-1101 | Horario:De 8:00 a.m. a 4:00 p.m. de Lunes a Viernes.';
    }
  }

  // Enviar la notificación por correo
  await sendEmailNotification(email, subject, message);
};



module.exports = { sendEmailNotification,notifyStatusChange };
