const SibApiV3Sdk = require('sib-api-v3-sdk');
const defaultClient = SibApiV3Sdk.ApiClient.instance;

// Configuración de Sendinblue
const apiKey = defaultClient.authentications['api-key'];
apiKey.apiKey = process.env.SENDINBLUE_API_KEY; // Variable de entorno para la API Key

const client = new SibApiV3Sdk.TransactionalEmailsApi(); // Instancia del cliente

// Generar un código de verificación y fecha de expiración
const generateVerificationCode = () => {
    const code = Math.floor(100000 + Math.random() * 900000).toString(); // Código de 6 dígitos
    const expiresAt = new Date(Date.now() + 3 * 60 * 1000); // Expira en 3 minutos
    return { code, expiresAt };
};

// Enviar el código por correo
const sendVerificationEmail = async (email) => {
    const { code, expiresAt } = generateVerificationCode();

    try {
        // Datos del correo
        const emailData = {
            sender: { email: 'santiagovs1402@gmail.com', name: 'Verify Code' },
            to: [{ email }],
            subject: 'Código de Verificación',
            htmlContent: `<h3>Tu código de verificación es: ${code}</h3><p>Este código expirará en 3 minutos: ${expiresAt.toLocaleTimeString()}</p>`
        };

        console.log(`Enviando correo a ${email} con código: ${code}`);
        await client.sendTransacEmail(emailData); // Envía el correo
        return { code, expiresAt };
    } catch (error) {
        console.error('Error al enviar el correo:', error.response?.body || error.message);
        throw new Error('Error al enviar el código de verificación.');
    }
};

module.exports = sendVerificationEmail;
