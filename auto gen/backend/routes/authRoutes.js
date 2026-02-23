const express = require('express');
const router = express.Router();
const {
    enrollStudent,
    login,
    registerAdmin,
    sendOtp,
    verifyOtp
} = require('../controllers/authController');

router.post('/student/enroll', enrollStudent);
router.post('/login', login); // Unified login
router.post('/admin/register', registerAdmin);
router.post('/send-otp', sendOtp);
router.post('/verify-otp', verifyOtp);

module.exports = router;
