const Enrollment = require('../models/Enrollment');
const CertificateRequest = require('../models/CertificateRequest');
const Certificate = require('../models/Certificate');

// @desc    Get student profile
const getProfile = async (req, res) => {
    const user = req.user;
    try {
        const coursesCount = await Enrollment.countDocuments({ studentId: user._id });
        const certificatesCount = await Certificate.countDocuments({ studentId: user._id });

        res.json({
            _id: user._id,
            name: user.name,
            email: user.email,
            studentId: user.studentId,
            role: user.role,
            stats: {
                courses: coursesCount,
                certificates: certificatesCount
            }
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get student progress
const getProgress = async (req, res) => {
    try {
        const enrollments = await Enrollment.find({ studentId: req.user._id })
            .populate('courseId', 'courseName courseCode duration');
        res.json(enrollments);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get only the logged-in student's certificate requests
const getMyRequests = async (req, res) => {
    try {
        const requests = await CertificateRequest.find({ studentId: req.user._id })
            .populate('courseId', 'courseName courseCode duration');
        res.json(requests);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update progress (Complete Course)
const updateProgress = async (req, res) => {
    const { courseId, completed } = req.body;

    try {
        const enrollment = await Enrollment.findOne({
            studentId: req.user._id,
            courseId,
        });

        if (!enrollment) {
            return res.status(404).json({ message: 'Not enrolled in this course' });
        }

        // Force set completed and progress to 100%
        enrollment.completed = true;
        enrollment.progress = 100;
        enrollment.endDate = Date.now();

        await enrollment.save();

        res.json({ message: 'Course marked as completed', enrollment });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Request certificate
const requestCertificate = async (req, res) => {
    const { courseId } = req.body;
    try {
        const enrollment = await Enrollment.findOne({ studentId: req.user._id, courseId });
        if (!enrollment || !enrollment.completed) {
            return res.status(400).json({ message: 'Course not completed' });
        }

        const existingRequest = await CertificateRequest.findOne({ studentId: req.user._id, courseId });
        if (existingRequest) {
            return res.status(400).json({ message: `Status: ${existingRequest.status}` });
        }

        const request = await CertificateRequest.create({ studentId: req.user._id, courseId });
        res.status(201).json({ message: 'Requested successfully', request });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get my certificates
const getCertificates = async (req, res) => {
    try {
        const certificates = await Certificate.find({ studentId: req.user._id })
            .populate('courseId', 'courseName');
        res.json(certificates);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getProfile,
    getProgress,
    getMyRequests, // Ensure this is exported
    updateProgress,
    requestCertificate,
    getCertificates,
};