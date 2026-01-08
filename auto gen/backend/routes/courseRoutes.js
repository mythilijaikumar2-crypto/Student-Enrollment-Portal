const express = require('express');
const router = express.Router();
const { getCourses } = require('../controllers/adminController');

// Public route to get courses
router.get('/', getCourses);

module.exports = router;
