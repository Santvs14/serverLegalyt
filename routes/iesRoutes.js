const express = require('express');
const router = express.Router();
const { registrarIES } = require('../controllers/iesController');

router.post('/registro-ies', registrarIES);

module.exports = router;
