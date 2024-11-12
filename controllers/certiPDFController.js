// backend/controllers/certiPDFController.js
const cloudinary = require('../config/cloudinary'); // Importar configuración de Cloudinary
const fs = require('fs');
const path = require('path');

// Función para manejar la generación del certificado
const subirCertificado = async (req, res) => {
    const { solicitudId } = req.params;

    // Generar la ruta del PDF
    const pdfPath = path.join(__dirname, '../certificados', `certificado_${solicitudId}.pdf`);

    try {
        // Aquí debes implementar la lógica para generar el PDF
        // Por ejemplo:
        // await generatePDF(solicitudId, pdfPath);

        // Verifica si el PDF fue generado correctamente
        if (!fs.existsSync(pdfPath)) {
            return res.status(400).json({ message: 'El PDF no fue generado correctamente.' });
        }

        // Subir el PDF a Cloudinary
        const result = await cloudinary.uploader.upload(pdfPath, {
            resource_type: 'raw',
            public_id: `certificados/${solicitudId}`,
            overwrite: true
        });

        // Verifica que el resultado contenga la URL
        if (!result || !result.secure_url) {
            return res.status(500).json({ message: 'Error al subir el certificado a Cloudinary.' });
        }

        // Retorna la URL del certificado
        const certificateUrl = result.secure_url;
        console.log('Certificado subido a Cloudinary:', certificateUrl);
        return res.status(200).json({ certificateUrl });
        
    } catch (error) {
        console.error('Error al subir el certificado a Cloudinary:', error);
        return res.status(500).json({ message: 'Error al generar el certificado', error });
    }
};

// Exporta la función
module.exports = { subirCertificado };