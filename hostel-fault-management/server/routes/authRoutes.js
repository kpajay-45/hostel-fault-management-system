const express = require('express');
const router = express.Router();
const { registerUser, loginUser, googleLogin } = require('../controllers/authController');

// @route   POST /api/auth/register
// @desc    Register a new user
router.post('/register', registerUser);

// @route   POST /api/auth/login
// @desc    Authenticate user & get token
router.post('/login', loginUser);

// @route   POST /api/auth/google
// @desc    Authenticate user via Google
router.post('/google', googleLogin);

module.exports = router;