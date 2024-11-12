// config/cloudinary.js
const cloudinary = require('cloudinary').v2;

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME, // 'dc78k55qd'
    api_key: process.env.CLOUDINARY_API_KEY,       // '574688489413124'
    api_secret: process.env.CLOUDINARY_API_SECRET, // '0q7TZlr15pEAKWZQkdFFK9ibWQU'
});

module.exports = cloudinary;
