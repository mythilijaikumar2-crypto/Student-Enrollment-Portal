const express = require('express');
const router = express.Router();
const {
    enrollStudent,
    login,
    registerAdmin
} = require('../controllers/authController');

router.post('/student/enroll', enrollStudent);
router.post('/login', login); // Unified login
router.post('/admin/register', registerAdmin);

module.exports = router;
