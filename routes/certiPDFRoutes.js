// backend/routes/certiPDFRoutes.js
const express = require('express');
const multer = require('multer');
const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const { notifyStatusChange } = require('../controllers/notificationController'); // Asegúrate de que la ruta sea correcta
require('dotenv').config();



// Asegúrate de que tu configuración de Cloudinary esté aquí y sea correcta
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

const router = express.Router();

// Ruta para generar y subir el certificado PDF
router.post('/certificado/:id', async (req, res) => {
    const { id } = req.params;

    try {
        // Obtener la solicitud desde la base de datos
        const solicitud = await Solicitud.findById(id);
        if (!solicitud || solicitud.estado !== 'aprobada') {
            return res.status(400).json({ message: 'La solicitud no está aprobada o no existe.' });
        }

        // Ruta local para guardar el PDF temporalmente
        const pdfPath = path.join(__dirname, '../certificados', `certificado_${id}.pdf`);
        const doc = new PDFDocument();
        
        // Crear el archivo PDF localmente
        doc.pipe(fs.createWriteStream(pdfPath));
        
        // Contenido del PDF
        doc.fontSize(20).text("Certificado de Legalización de Título", { align: "center" });
        doc.moveDown();
        doc.fontSize(14).text(`Este es un certificado de legalización emitido para:`);
        doc.moveDown();
        doc.text(`Nombre: ${solicitud.nombre} ${solicitud.apellido}`);
        doc.text(`Carrera: ${solicitud.carrera}`);
        doc.text(`Universidad: ${solicitud.universidad}`);
        doc.text(`Fecha de Legalización: ${new Date().toLocaleDateString()}`);
        doc.moveDown();
        doc.text("Este documento certifica que el título ha sido aprobado y legalizado.", { align: "center" });
        
        // Finalizar el PDF
        doc.end();

        // Esperar a que el PDF se haya escrito en el sistema de archivos
        doc.on('finish', async () => {
            console.log("PDF generado exitosamente en la ruta local:", pdfPath);
            
            try {
                // Confirmar que el archivo existe en el sistema de archivos
                await fs.promises.access(pdfPath, fs.constants.F_OK);

                // Subir el archivo PDF a Cloudinary
                const result = await cloudinary.uploader.upload(pdfPath, {
                    resource_type: 'auto',
                    public_id: `certificado_${id}`,
                    overwrite: true
                });
                console.log("Certificado subido exitosamente a Cloudinary en la URL:", result.secure_url);

                // Guardar la URL del certificado en la base de datos
                const certificacion = new Certificacion({
                    solicitudId: id,
                    nombre: solicitud.nombre,
                    apellido: solicitud.apellido,
                    carrera: solicitud.carrera,
                    universidad: solicitud.universidad,
                    archivoCertificado: result.secure_url
                });

                await certificacion.save();

                // Notificar al usuario
                const user = await User.findById(solicitud.userId);
                if (user) {
                    await notifyStatusChange(user.email, 'aprobado', result.secure_url);
                }

                // Responder con la URL del certificado en Cloudinary
                res.json({ certificateUrl: result.secure_url });
                
                // Eliminar el archivo PDF local después de subirlo
                //fs.unlinkSync(pdfPath);
                console.log("Archivo PDF local eliminado después de la subida.");
            } catch (uploadError) {
                console.error("Error al subir el certificado a Cloudinary:", uploadError);
                res.status(500).json({ message: "Error al subir el certificado a Cloudinary." });
            }
        });

        doc.on('error', (error) => {
            console.error("Error al crear el documento PDF:", error);
            res.status(500).json({ message: "Error al crear el documento PDF." });
        });

    } catch (error) {
        console.error("Error al procesar la solicitud:", error);
        res.status(500).json({ message: "Error al procesar la solicitud." });
    }
});

module.exports = router;