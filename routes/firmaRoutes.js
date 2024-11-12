// routes/firmaRoutes.js

const express = require('express');
const router = express.Router();
const { guardarFirma } = require('../controllers/firmaController');

router.post('/guardar', guardarFirma);

module.exports = router;
