const Certificate = require('../models/Certificate');

// @desc    Verify Certificate
// @route   GET /api/certificate/verify/:certificateId
// @access  Public
const verifyCertificate = async (req, res) => {
    const { certificateId } = req.params;

    try {
        const certificate = await Certificate.findOne({ certificateId })
            .populate('studentId', 'name email')
            .populate('courseId', 'courseName courseCode duration');

        if (!certificate) {
            return res.status(404).json({ message: 'Certificate not found' });
        }

        res.json({
            valid: true,
            certificateId: certificate.certificateId,
            student: certificate.studentId.name,
            course: certificate.courseId.courseName,
            issueDate: certificate.issueDate,
            verificationCode: certificate.verificationCode,
            downloadUrl: certificate.certificateUrl
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { verifyCertificate };
