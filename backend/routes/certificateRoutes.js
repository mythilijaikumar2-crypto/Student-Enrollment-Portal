const express = require('express');
const router = express.Router();
const { verifyCertificate } = require('../controllers/certificateController');

router.get('/verify/:certificateId', verifyCertificate);

module.exports = router;
