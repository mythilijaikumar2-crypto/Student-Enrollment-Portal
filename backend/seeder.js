

const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Admin = require('./models/Admin');
const Student = require('./models/Student');
const Course = require('./models/Course');
const Enrollment = require('./models/Enrollment');
const connectDB = require('./config/db');

dotenv.config();

connectDB();

const importData = async () => {
    try {
        await Admin.deleteMany();
        await Student.deleteMany();
        await Course.deleteMany();
        await Enrollment.deleteMany();

        // Create Admin
        const adminUser = new Admin({
            name: 'System Admin',
            email: 'admin@nxtsync.com',
            password: 'password123', // Will be hashed by pre-save hook
            role: 'admin',
        });

        await adminUser.save();
        console.log('Admin Created: admin@nxtsync.com / password123');

        const courses = [
            {
                courseName: 'Artificial Intelligence (AI) & Machine Learning',
                courseCode: 'AI-ML',
                duration: '6 Months',
                description: 'Master AI and ML concepts.'
            },
            {
                courseName: 'Data Science & Data Analytics',
                courseCode: 'DS-DA',
                duration: '6 Months',
                description: 'Learn to analyze and interpret complex data.'
            },
            {
                courseName: 'Cybersecurity & Ethical Hacking',
                courseCode: 'CS-EH',
                duration: '4 Months',
                description: 'Protect systems and networks from cyber attacks.'
            },
            {
                courseName: 'Cloud Computing & DevOps',
                courseCode: 'CC-DO',
                duration: '4 Months',
                description: 'Deploy and manage applications in the cloud.'
            },
            {
                courseName: 'Full Stack Web Development',
                courseCode: 'FS-WD',
                duration: '5 Months',
                description: 'Build modern web applications from scratch.'
            }
        ];

        await Course.insertMany(courses);
        console.log('Courses Imported!');

        console.log('Data Seeding Completed!');
        process.exit();
    } catch (error) {
        console.error(`${error}`);
        process.exit(1);
    }
};

if (process.argv[2] === '-d') {
    // destroyData();
} else {
    importData();
}
