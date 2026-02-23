const mongoose = require('mongoose');

const otpSchema = new mongoose.Schema({
    identifier: { type: String, required: true }, // email or mobile
    type: { type: String, enum: ['email', 'mobile'], required: true },
    code: { type: String, required: true },
    expiresAt: { type: Date, required: true },
    verified: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.model('Otp', otpSchema);
