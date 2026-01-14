const express = require('express');
const { adminLogin, verifyAdmin } = require('../controllers/authController');
const auth = require('../middlewares/authMiddleware');

const router = express.Router();

// POST /api/auth/login
router.post('/login', adminLogin);

// GET /api/auth/verify
// Verifies a valid admin JWT (admin session check)
router.get('/verify', auth, verifyAdmin);

module.exports = router;
