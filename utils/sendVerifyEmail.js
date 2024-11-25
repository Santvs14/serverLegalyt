const SibApiV3Sdk = require('sib-api-v3-sdk');  // Librería de Sendinblue
const defaultClient = SibApiV3Sdk.ApiClient.instance;

// Configura el cliente de Sendinblue con tu clave API
const apiKey = defaultClient.authentications['api-key'];
apiKey.apiKey = process.env.SENDINBLUE_API_KEY; // Asegúrate de tener tu clave de API en tus variables de entorno

const client = SibApiV3Sdk.ApiClient.instance;
client.authentications['api-key'].apiKey = apiKey;

// Función para generar un código de verificación
const generateVerificationCode = () => {
    const code = Math.floor(100000 + Math.random() * 900000); // Genera un código de 6 dígitos
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 10); // Expira en 10 minutos
    return { code, expiresAt };
};

// Función para enviar el código de verificación por correo
const sendVerificationEmail = async (email) => {
    const { code, expiresAt } = generateVerificationCode();

    try {
        // Envía el correo electrónico con el código de verificación
        const emailData = {
            sender: { email: 'santiagovs1402@gmail.com' },  // Reemplaza con tu email de envío
            to: [{ email: email }],
            subject: 'Código de Verificación',
            htmlContent: `<h3>Tu código de verificación es: ${code}</h3><p>Este código expirará en ${expiresAt.toLocaleTimeString()}</p>`
        };

        const apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();
        await apiInstance.sendTransacEmail(emailData);

        return { code, expiresAt };
    } catch (error) {
        throw new Error('Error al enviar el código de verificación');
    }
};

module.exports = sendVerificationEmail;
