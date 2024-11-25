const SibApiV3Sdk = require('sib-api-v3-sdk');  // Librería de Sendinblue
const defaultClient = SibApiV3Sdk.ApiClient.instance;

// Configura el cliente de Sendinblue con tu clave API
const apiKey = defaultClient.authentications['api-key'];
apiKey.apiKey = process.env.SENDINBLUE_API_KEY;  // Asegúrate de tener tu clave de API en tus variables de entorno
console.log('Clave de API verify:', process.env.SENDINBLUE_API_KEY);

const client = new SibApiV3Sdk.TransactionalEmailsApi(); // Aquí solo instanciamos una vez el cliente

// Función para generar un código de verificación
const generateVerificationCode = () => {
    const code = Math.floor(100000 + Math.random() * 900000).toString().padStart(6, '0');

    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 3); // Expira en 3 minuto
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

        // Enviar el correo
        await client.sendTransacEmail(emailData); // Usamos el cliente correctamente aquí

        return { code, expiresAt };
    } catch (error) {
        console.error('Error al enviar el código de verificación:', error.response.body);
        throw new Error('Error al enviar el código de verificación');
    }
};

module.exports = sendVerificationEmail;
