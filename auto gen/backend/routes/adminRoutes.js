const express = require('express');
const router = express.Router();
const { protect, admin } = require('../middleware/authMiddleware');
const {
    createCourse,
    getStudents,
    getCertificateRequests,
    approveCertificate,
    rejectCertificate,
    getOverview,
} = require('../controllers/adminController');

router.get('/overview', protect, admin, getOverview);
router.post('/course', protect, admin, createCourse);
router.get('/students', protect, admin, getStudents);
router.get('/certificate/requests', protect, admin, getCertificateRequests);
router.post('/certificate/approve', protect, admin, approveCertificate);
router.post('/certificate/reject', protect, admin, rejectCertificate); // New Route

module.exports = router;