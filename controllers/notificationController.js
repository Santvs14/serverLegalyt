
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







/**
 * Función para notificar el cambio de estado de una solicitud
 */
const notifyStatusChange = async (solicitudId, estado) => {
  console.log(`[Notify] Iniciando notificación para solicitudId: ${solicitudId}, estado: ${estado}`);

  try {
    // 1️⃣ Buscar la solicitud
    const solicitud = await Solicitud.findById(solicitudId);
    if (!solicitud) {
      console.log('[Notify] Solicitud no encontrada');
      return;
    }
    console.log(`[Notify] Solicitud encontrada: ${solicitud.nombre} ${solicitud.apellido}`);

    // 2️⃣ Inicializar mensaje
    let message = '';
    let certificadoInfo = null;

    // 3️⃣ Si es aprobado, buscar certificación
    if (estado === 'aprobado') {
      certificadoInfo = await Certificacion.findOne({ solicitudId });
      if (certificadoInfo) {
        console.log('[Notify] Certificación encontrada:', certificadoInfo._id);
        if (certificadoInfo.archivoCertificado) {
          message = `¡Enhorabuena! Su solicitud ha sido aprobada.<br>
          Puede descargar su certificado aquí: <a href="${certificadoInfo.archivoCertificado}" target="_blank">Descargar certificado</a>`;
        } else {
          message = '¡Enhorabuena! Su solicitud ha sido aprobada. El archivo del certificado no está disponible.';
        }
      } else {
        console.log('[Notify] No se encontró certificación para esta solicitud');
        message = '¡Enhorabuena! Su solicitud ha sido aprobada. No se encontró el certificado.';
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
          message = 'Su solicitud ha sido rechazada. Para más información contacte nuestras oficinas o vía teléfono.';
      }
    }

    // 4️⃣ Enviar correo
    const result = await sendEmailNotification(solicitud.email, 'Actualización de estado de la solicitud', message);
    console.log('[Notify] Resultado del envío:', result);

  } catch (error) {
    console.error('[Notify] Error durante la notificación:', error);
  }

  console.log('[Notify] Proceso de notificación finalizado');
};

module.exports = { sendEmailNotification, notifyStatusChange };