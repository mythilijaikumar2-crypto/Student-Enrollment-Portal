const mongoose = require('mongoose');

const certificateRequestSchema = new mongoose.Schema({
    // FIX: Changed ref from 'User' to 'Student' to match your Student.js file
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true }, 
    courseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
    status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
    rejectionReason: { type: String, default: '' },
    requestedAt: { type: Date, default: Date.now },
    // FIX: Changed ref from 'User' to 'Admin' to match your Admin.js file
    approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin' }, 
}, { timestamps: true });

module.exports = mongoose.model('CertificateRequest', certificateRequestSchema);