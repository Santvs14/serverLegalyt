
const streamifier = require('streamifier');  // Asegúrate de importar 'streamifier'
const cloudinary = require('cloudinary').v2;
const fs = require('fs');
const path = require('path');
const PDFDocument = require('pdfkit');
const Solicitud = require('../models/Solicitud');
const Certificacion = require('../models/certificacion'); // Importa el modelo Certificacion
const Firma = require('../models/Firma');  // Asegúrate de importar el modelo de Firma

require('dotenv').config();
require('dotenv').config();
console.log("Cloud Name:", process.env.CLOUDINARY_CLOUD_NAME);
console.log("API Key:", process.env.CLOUDINARY_API_KEY);
console.log("API Secret:", process.env.CLOUDINARY_API_SECRET ? "Loaded" : "Not Loaded");


cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

exports.generarCertificado = async (req, res) => {
    const solicitudId = req.params.id; // Captura el ID de la solicitud desde los parámetros

    console.log(`Generando certificado para la solicitud: ${solicitudId}`); // Verifica el ID

    try {
        // 1. Buscar la solicitud en la base de datos
        const solicitud = await Solicitud.findById(solicitudId);
        if (!solicitud) {
            console.log('La solicitud no existe');
            return res.status(404).json({ message: 'La solicitud no existe.' });
        }console.log(`Solicitud encontrada: ${solicitud.nombre} ${solicitud.apellido}`); // Log para confirmar que la solicitud fue encontrada
       
        const firma = await Firma.findOne({ solicituds: solicitudId }).populate('admins');
        console.log('Firma:',firma)
        if (!firma) {
            return res.status(404).json({ message: 'La firma no existe.' });
        }
       
        // Crear el archivo PDF en memoria
        const doc = new PDFDocument();
        const buffers = [];
        doc.on('data', buffers.push.bind(buffers)); // Almacena el contenido del PDF en memoria
        doc.on('end', async () => {
            const pdfBuffer = Buffer.concat(buffers); // Crea el buffer del archivo PDF

            console.log('PDF generado con éxito'); // Log para confirmar que el PDF fue generado
            fs.writeFileSync('certificado.pdf', pdfBuffer);
            console.log('Certificado guardado como PDF en el servidor');
            // 2. Subir el archivo PDF a Cloudinary directamente desde el buffer
      try {
        console.log('Subiendo certificado a Cloudinary...');
        const uploadStream = cloudinary.uploader.upload_stream(
          {
            folder: 'certificaciones',
            resource_type: 'raw', // Prueba como imagen para permitir la visualización en navegador
            public_id: `certificado_${solicitudId}`,
            overwrite: true,
          },
          async (error, result) => {
            if (error) {
              console.error('Error al subir el certificado a Cloudinary:', error);
              return res.status(500).json({ message: 'Error al subir el certificado a Cloudinary' });
            }

            // Verificar si se subió correctamente
            if (result && result.secure_url) {
              const certificateUrl = result.secure_url;
              console.log(`Certificado subido y visualizable en: ${certificateUrl}`);

              // 3. Crear un nuevo documento de certificación y guardar la URL
              const nuevaCertificacion = new Certificacion({
                solicitudId: solicitud._id,
                nombre: solicitud.nombre,
                apellido: solicitud.apellido,
                carrera: solicitud.carrera,
                universidad: solicitud.universidad,
                archivoCertificado: certificateUrl, // Guardamos la URL del certificado en el campo archivoCertificado
                //idManual: 'ID-12345'  // Un valor manual de tu elección


              });
              console.log('Solicitud ID:', solicitud._id);

              // Guardamos la nueva certificación en la base de datos
              await nuevaCertificacion.save();
              console.log('Certificación guardada correctamente con la URL del archivo');

              return res.json({ certificateUrl });
            } else {
              console.error('No se recibió una URL válida de Cloudinary.');
              return res.status(500).json({ message: 'Error al subir el certificado a Cloudinary' });
            }
          }
        );

        // Enviar el PDF como stream a Cloudinary
        console.log("Enviando el certificado como stream a Cloudinary...");
        streamifier.createReadStream(pdfBuffer).pipe(uploadStream);
      } catch (error) {
        console.error('Error al subir el certificado a Cloudinary:', error);
        return res.status(500).json({ message: 'Error al subir el certificado a Cloudinary' });
      }
    });
        // Agregar contenido al PDF
        const logoPath = path.join(__dirname, '..', 'public', 'images', 'mesy.png'); // Ajusta la ruta del logo en el servidor backend
        doc.image(logoPath, { fit: [100, 100], align: 'center', valign: 'top' });
        doc.moveDown(8); // Salto de línea entre los textos

        doc.fontSize(23).text("Certificado de Legalización de Título", { align: "center" });
        doc.moveDown();
        doc.fontSize(14).text(`Este es un certificado de legalización emitido para:`);
        doc.moveDown();
        doc.text(`Nombre: ${solicitud.nombre} ${solicitud.apellido}`);
        doc.text(`Carrera: ${solicitud.carrera}`);
        doc.text(`Universidad: ${solicitud.universidad}`);
        doc.text(`Fecha de Legalización: ${new Date().toLocaleDateString()}`);
        doc.moveDown(3);
        doc.text("Este documento certifica que el título ha sido emitido.", { align: "center" });

        doc.moveDown(5);

        // Agregar firma al PDF
        if (firma && firma.firmaDigital) {
            // Eliminar el prefijo Base64 si existe
            const firmaBase64 = firma.firmaDigital.replace(/^data:image\/\w+;base64,/, "");
            const firmaBuffer = Buffer.from(firmaBase64, 'base64');

            console.log('firmaBuffer:', firmaBuffer);

           // Define las coordenadas para la firma
            const x = doc.page.width / 2 - 50; // Centrado horizontalmente, ajustando el tamaño de la imagen
            const y = doc.y; // Usa la posición actual en `y`

            // Agrega la firma como imagen en el PDF
            doc.image(firmaBuffer, x, y, { width: 68, height: 68 });
            doc.moveDown(4.3); // Añade un ligero espaciado

            // Agrega el texto justo debajo de la firma
            doc.fontSize(10).text("Firma del Director de Legalización", { align: "center" });
        }
        doc.moveDown(4.3);

        doc.fontSize(10).text(`Este certificado cumple con los criterios de legalizacion es valido para realizar cualquier solicitud o procedimiento.`);
        // Finaliza el documento
        doc.end();

    } catch (error) {
        console.error("Error al generar el certificado:", error);
        return res.status(500).json({ message: 'Error al generar el certificado' });
    }
};

