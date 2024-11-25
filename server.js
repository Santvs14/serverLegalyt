// Server.js - Archivo de inicio del servidor Express

// Importar dependencias
const cors = require('cors');
const express = require('express');
const mongoose = require('mongoose');

require('dotenv').config();//Permitir varibles de entorno
const path = require('path');
const bodyParser = require('body-parser');

// Importar rutas
const userRoutes = require('./routes/user');
const adminRoutes = require('./routes/admin');
const adminRoutes2 = require('./routes/adminRoutes');
const legalizationRoutes = require('./routes/legalization');
const emailRoutes = require('./routes/email');
const tituloRoutes = require('./routes/tituloRoutes');
const certificateRoutes = require('./routes/certificacionRoutes');
const solicitudRoutes = require('./routes/solicitudRoutes');
const { notifyStatusChange } = require('./controllers/notificationController'); // Asegúrate de que la ruta es correcta
const iesRoutes = require('./routes/iesRoutes');
const { verifyCode, sendVerificationCode } = require('./controllers/userController'); // Ruta al controlador




// Inicializar la aplicación de Express
const app = express();
// Configurar el servidor para escuchar en el puerto 5000
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Servidor escuchando en el puerto... ${PORT}`);
});



// Conectar a la base de datos MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Conectado a MongoDB'))
  .catch(err => console.error('Error de conexión a MongoDB:', err));

// Middleware
app.use(express.json()); // Para parsear cuerpos JSON
const corsOptions = {
  origin: 'https://legaly-titulo.vercel.app', // URL de producción de tu frontend
  methods: ['GET', 'POST', 'PUT', 'DELETE'], // Métodos permitidos
  allowedHeaders: ['Content-Type', 'Authorization'], // Encabezados permitidos
};

app.use(cors(corsOptions));


app.use(bodyParser.json()); // Para parsear cuerpos JSON
app.use(express.urlencoded({ extended: true })); // Para formularios URL-encoded
app.use(bodyParser.urlencoded({ extended: true })); // Para formularios URL-encoded
app.use(express.urlencoded({ extended: true })); // Para manejar formularios

app.use(express.static('public')); // Para archivos estáticos desde la carpeta "public"

// Servir imágenes estáticas
app.use('/images', express.static(path.join(__dirname, 'public/images')));
//app.use('/uploads', express.static('uploads'));

// Servir archivos estáticos de certificados
//app.use('/certificados', express.static(path.join(__dirname, 'certificados')));

// Rutas del servidor
app.get('/', (req, res) => {
  res.send('¡Hola desde el servidor Express en Render!');
});

// Ruta para verificar el estado del servicio
app.get('/status', (req, res) => {
  res.status(200).json({ 
    status: 'active', 
    message: 'El servicio está activo y funcionando correctamente.' 
  });
});



// Ruta para notificación
app.post('/notify', async (req, res) => {
  const { email, estado } = req.body;

  // Validar que el email y el estado no estén vacíos
  if (!email || !estado) {
    return res.status(400).json({ message: 'Email y estado son requeridos.' });
  }

  try {
    // Llama a la función para enviar la notificación
    await notifyStatusChange(email, estado);
    return res.status(200).json({ message: 'Notificación enviada exitosamente' });
  } catch (error) {
    console.error('Error al enviar notificación:', error);
    return res.status(500).json({ message: 'Error al enviar notificación' });
  }
});

// Definir las rutas de la API
app.use('/api/users', userRoutes); 
app.use('/api/admins', adminRoutes); // Registro admin
app.use('/api/admins', adminRoutes2); // Inicio sesión admin
app.use('/api/legalization', legalizationRoutes); 
app.use('/certificate', certificateRoutes);
app.use('/api/titulos', tituloRoutes);
app.use('/api', emailRoutes); // Para las rutas de correo
app.use('/api/solicitud', solicitudRoutes); // Ruta para solicitudes
app.use('/api', iesRoutes);  // Asegúrate de usar la ruta correcta
app.use('/api/ies', iesRoutes);//Mostrar registro Ies

app.post('/send-code', sendVerificationCode);
app.post('/verify-code', verifyCode);

app.use((req, res) => {
  res.status(404).json({ error: 'Ruta no encontrada' });
});
app.use((req, res, next) => {
  console.log(`Solicitud recibida: ${req.method} ${req.url}`);
  next();
});


// Ruta específica para notificaciones SMS
app.post('/api/legalization/notifications', (req, res) => {
  const { telefono, mensaje } = req.body;
  res.status(200).json({ message: 'Notificación enviada' });
});

// Middleware de manejo de errores
app.use((err, req, res, next) => {
  console.error('Error del servidor:', err);
  res.status(500).json({ message: 'Error interno del servidor' });
});

