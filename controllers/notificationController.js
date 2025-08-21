// controllers/notificationController.js
require('dotenv').config();
console.log('API Key-SENDINBLUE:', process.env.SENDINBLUE_API_KEY);

const SibApiV3Sdk = require('sib-api-v3-sdk');
const defaultClient = SibApiV3Sdk.ApiClient.instance;

const apiKey = defaultClient.authentications['api-key'];
apiKey.apiKey = process.env.SENDINBLUE_API_KEY;

const { generarCertificado  } = require('./certificacionController');

// Función para enviar correo
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
        console.log('[Notify] Email enviado exitosamente a', email);
    } catch (error) {
        console.error('[Notify] Error al enviar email:', error);
    }
};

// Función principal de notificación
const notifyStatusChange = async (solicitudId, estado) => {
    console.log('[Notify] Iniciando notificación para solicitudId:', solicitudId, 'estado:', estado);

    try {
        // Obtener solicitud y certificación asociada
        const data = await generarCertificado(solicitudId);

        if (!data) {
            console.log('[Notify] La solicitud no existe');
            return;
        }

        const { solicitud, certificacion } = data;

        let subject = 'Actualización de estado de la solicitud';
        let message = '';

        if (estado === 'aprobado') {
            if (certificacion && certificacion.archivoCertificado) {
                message = `¡Enhorabuena, ${solicitud.nombre} ${solicitud.apellido}! Su solicitud ha sido aprobada. Puede descargar su certificado aquí: <a href="${certificacion.archivoCertificado}" target="_blank">Descargar certificado</a>`;
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
                    message = `Hola ${solicitud.nombre}, su solicitud ha sido rechazada. Para saber los motivos visite nuestras oficinas o contacte vía teléfono: (809) 731 1100 | Fax: 809-731-1101 | Horario: De 8:00 a.m. a 4:00 p.m. de Lunes a Viernes.`;
                    break;
            }
        }

        // Enviar correo
        await sendEmailNotification(solicitud.email, subject, message);
        console.log('[Notify] Notificación enviada con éxito a:', solicitud.email);

    } catch (error) {
        console.error('[Notify] Error durante la notificación:', error);
    }
};

module.exports = { sendEmailNotification, notifyStatusChange };
