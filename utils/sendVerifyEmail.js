const SibApiV3Sdk = require('sib-api-v3-sdk');  // Librería de Sendinblue
const defaultClient = SibApiV3Sdk.ApiClient.instance;

// Configura el cliente de Sendinblue con tu clave API
const apiKey = defaultClient.authentications['api-key'];
apiKey.apiKey = process.env.SENDINBLUE_API_KEY;  // Asegúrate de tener tu clave de API en tus variables de entorno
console.log('Clave de API verify:', process.env.SENDINBLUE_API_KEY);

const client = new SibApiV3Sdk.TransactionalEmailsApi(); // Aquí solo instanciamos una vez el cliente

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
        // Verifica que la clave de API esté configurada correctamente
        if (!process.env.SENDINBLUE_API_KEY) {
            throw new Error('La clave de API de Sendinblue no está configurada.');
        }

        // Prepara los datos del correo
        const emailData = {
            sender: { email: 'santiagovs1402@gmail.com' },  // Reemplaza con tu email de envío
            to: [{ email: email }],
            subject: 'Código de Verificación',
            htmlContent: `<h3>Tu código de verificación es: ${code}</h3><p>Este código expirará en ${expiresAt.toLocaleTimeString()}</p>`
        };

        // Envía el correo electrónico
        await client.sendTransacEmail(emailData); // Usamos el cliente correctamente aquí

        // Retorna el código y la fecha de expiración
        return { code, expiresAt };
    } catch (error) {
        // Manejo de errores con mayor detalle
        if (error.response) {
            // Si el error es generado por una respuesta de la API
            console.error('Error al enviar el código de verificación:', error.response.body);
            throw new Error(error.response.body.message || 'Error desconocido');
        } else {
            // Error de red o del servidor
            console.error('Error de conexión o configuración:', error);
            throw new Error('Error de conexión con el servidor de Sendinblue');
        }
    }
};

module.exports = sendVerificationEmail;
