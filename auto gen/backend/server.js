const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');
const path = require('path');

dotenv.config();

// 1. Connect to Database
connectDB();

// 2. IMPORTANT: Manually import models here to register schemas before routes use them
require('./models/Student');
require('./models/Admin');
require('./models/Course');
require('./models/CertificateRequest');
require('./models/Certificate');
require('./models/Enrollment');

const app = express();

app.use(express.json());
app.use(cors());

// 3. Routes (Now safe to load because models are registered)
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/courses', require('./routes/courseRoutes'));
app.use('/api/student', require('./routes/studentRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));
app.use('/api/certificate', require('./routes/certificateRoutes'));

// Serve static files for certificates
app.use('/certificates', express.static('public/certificates'));

// Serve Frontend
app.use(express.static(path.join(__dirname, '../frontend')));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));