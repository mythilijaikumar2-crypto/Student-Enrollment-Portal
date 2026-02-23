const Student = require('../models/Student');
const Admin = require('../models/Admin');
const Course = require('../models/Course');
const Enrollment = require('../models/Enrollment');
const Otp = require('../models/Otp'); // Import Otp model
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const sendEmail = require('../utils/sendEmail');

const generateToken = (id, role) => {
    return jwt.sign({ id, role }, process.env.JWT_SECRET, {
        expiresIn: '30d',
    });
};

// @desc    Register a new student and enroll in a course
// @route   POST /api/student/enroll
// @access  Public
const enrollStudent = async (req, res) => {
    const { name, email, mobileNumber, courseId } = req.body;

    try {
        // 1. Check if Email and Mobile are Verified
        const emailOtp = await Otp.findOne({ identifier: email, type: 'email', verified: true });
        if (!emailOtp) {
            return res.status(400).json({ message: 'Email address not verified. Please verify your email.' });
        }

        const mobileOtp = await Otp.findOne({ identifier: mobileNumber, type: 'mobile', verified: true });
        if (!mobileOtp) {
            return res.status(400).json({ message: 'Mobile number not verified. Please verify your mobile number.' });
        }

        const studentExists = await Student.findOne({ email });

        if (studentExists) {
            return res.status(400).json({ message: 'Student with this email already exists' });
        }

        const course = await Course.findById(courseId);
        if (!course) {
            return res.status(404).json({ message: 'Course not found' });
        }

        // Generate Student ID
        const year = new Date().getFullYear();
        const count = await Student.countDocuments();
        const sequence = (count + 1).toString().padStart(4, '0');
        const org = 'nxtsync';
        const studentId = `${org}-${course.courseCode}-${year}-${sequence}`.toLowerCase();

        // Generate Random Password
        const password = Math.random().toString(36).slice(-8);

        const student = await Student.create({
            name,
            email,
            mobileNumber,
            password,
            studentId,
        });

        // Create Enrollment
        await Enrollment.create({
            studentId: student._id,
            courseId: course._id,
        });

        // Send Email
        const message = `
            <h1>Welcome to NXTSYNC!</h1>
            <p>You have successfully enrolled in ${course.courseName}.</p>
            <h3>Your Credentials:</h3>
            <ul>
                <li><strong>Student ID:</strong> ${studentId}</li>
                <li><strong>Password:</strong> ${password}</li>
            </ul>
            <p>Please login to your dashboard to access your course materials.</p>
        `;

        // --- DEV LOGGING: Ensure user sees credentials ---
        console.log('\n=============================================');
        console.log('NEW STUDENT DATA (DEV MODE):');
        console.log(`Student ID: ${studentId}`);
        console.log(`Password:   ${password}`);
        console.log('=============================================\n');

        try {
            await sendEmail({
                email: student.email,
                subject: 'Enrollment Successful - Credentials',
                html: message,
                message: `Welcome to NXTSYNC! Student ID: ${studentId}, Password: ${password}`
            });
        } catch (emailError) {
            console.error('Email sending failed:', emailError);
        }

        if (student) {
            res.status(201).json({
                _id: student._id,
                name: student.name,
                studentId: student.studentId,
                role: student.role,
                password: password, // Returning password for frontend display (E2E flow)
                message: 'Enrollment successful. Credentials sent to email.',
            });
        } else {
            res.status(400).json({ message: 'Invalid student data' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Unified Login for Student & Admin
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res) => {
    const { identifier, password } = req.body;

    if (!identifier || !password) {
        return res.status(400).json({ message: 'Please provide credentials' });
    }

    try {
        let user;
        let role;

        // Role Detection Logic
        const isAdmin = identifier.includes('@'); // If email -> Admin

        if (isAdmin) {
            // Check Admin Collection
            user = await Admin.findOne({ email: identifier });
            role = 'admin';
        } else {
            // Check Student Collection (Student ID)
            user = await Student.findOne({ studentId: identifier });
            role = 'student';
        }

        if (user && (await user.matchPassword(password))) {
            const token = generateToken(user._id, role);

            // Determine redirect URL
            const redirectUrl = role === 'admin'
                ? '/pages/admin/dashboard.html'
                : '/pages/student/dashboard.html';

            res.json({
                token,
                role,
                name: user.name,
                redirectUrl
            });
        } else {
            res.status(401).json({
                message: isAdmin ? 'Invalid Admin Email or Password' : 'Invalid Student ID or Password'
            });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Register a new admin (for setup)
// @route   POST /api/auth/admin/register
// @access  Public (Should be protected in prod)
const registerAdmin = async (req, res) => {
    const { name, email, password } = req.body;

    try {
        const adminExists = await Admin.findOne({ email });
        if (adminExists) {
            return res.status(400).json({ message: 'Admin already exists' });
        }

        const admin = await Admin.create({
            name,
            email,
            password,
            role: 'admin'
        });

        if (admin) {
            res.status(201).json({
                _id: admin._id,
                name: admin.name,
                email: admin.email,
                token: generateToken(admin._id, 'admin')
            });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Send OTP for verification
// @route   POST /api/auth/send-otp
// @access  Public
const sendOtp = async (req, res) => {
    const { identifier, type } = req.body;

    if (!identifier || !type) {
        return res.status(400).json({ message: 'Identifier and type are required' });
    }

    try {
        const code = Math.floor(100000 + Math.random() * 900000).toString();
        const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

        // Upsert OTP
        await Otp.findOneAndUpdate(
            { identifier, type },
            { code, expiresAt, verified: false },
            { upsert: true, new: true }
        );

        if (type === 'email') {
            try {
                await sendEmail({
                    email: identifier,
                    subject: 'Your Verification Code',
                    html: `<h1>${code}</h1><p>This code is valid for 10 minutes.</p>`,
                    message: `Your verification code is ${code}`
                });
            } catch (emailError) {
                console.log('---------------------------------------------------');
                console.log('EMAIL SERVICE ERROR (Soft Fail):', emailError.message);
                console.log(`DEVELOPMENT MODE - EMAIL OTP for ${identifier}: ${code}`);
                console.log('---------------------------------------------------');
            }
            // Log for dev convenience regardless of email success
            console.log(`EMAIL OTP for ${identifier}: ${code}`);
        } else if (type === 'mobile') {
            // Mock SMS
            console.log(`MOBILE OTP for ${identifier}: ${code}`);
        }

        res.json({ message: `${type.charAt(0).toUpperCase() + type.slice(1)} OTP sent successfully` });
    } catch (error) {
        res.status(500).json({ message: 'Failed to send OTP: ' + error.message });
    }
};

// @desc    Verify OTP
// @route   POST /api/auth/verify-otp
// @access  Public
const verifyOtp = async (req, res) => {
    const { identifier, type, code } = req.body;

    try {
        const otpRecord = await Otp.findOne({ identifier, type });

        if (!otpRecord) {
            return res.status(400).json({ message: 'No OTP found for this identifier' });
        }

        if (otpRecord.code !== code) {
            return res.status(400).json({ message: 'Invalid OTP code' });
        }

        if (otpRecord.expiresAt < Date.now()) {
            return res.status(400).json({ message: 'OTP has expired' });
        }

        otpRecord.verified = true;
        await otpRecord.save();

        res.json({ message: 'Verification successful' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    enrollStudent,
    login,
    registerAdmin,
    sendOtp,
    verifyOtp
};
