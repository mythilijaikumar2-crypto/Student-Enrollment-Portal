const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
    getProfile,
    getProgress,
    updateProgress,
    requestCertificate,
    getCertificates,
    getMyRequests // Destructure it here
} = require('../controllers/studentController');

router.get('/profile', protect, getProfile);
router.get('/progress', protect, getProgress);
router.put('/progress', protect, updateProgress);
router.post('/certificate/request', protect, requestCertificate);
router.get('/certificate', protect, getCertificates);
router.get('/certificate/my-requests', protect, getMyRequests); // Use it here

module.exports = router;