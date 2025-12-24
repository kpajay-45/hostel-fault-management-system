const db = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library');

/**
 * @desc    Register a new user
 * @route   POST /api/auth/register
 * @access  Public
 */
const registerUser = async (req, res) => {
  const { name, email, password, room_number } = req.body;

  // 1. Basic validation
  if (!name || !email || !password) {
    return res.status(400).json({ message: 'Please enter all required fields (name, email, password).' });
  }

  try {
    // 2. Check if user already exists
    const [existingUsers] = await db.query('SELECT email FROM users WHERE email = ?', [email]);

    if (existingUsers.length > 0) {
      return res.status(409).json({ message: 'User with this email already exists.' });
    }

    // 3. Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // 4. Insert new user into the database
    const [result] = await db.query(
      'INSERT INTO users (name, email, password, room_number) VALUES (?, ?, ?, ?)',
      [name, email, hashedPassword, room_number || null] // Use null if room_number is not provided
    );

    // 5. Respond with success
    res.status(201).json({
      message: 'User registered successfully.',
      userId: result.insertId,
    });

  } catch (error) {
    console.error('Registration Error:', error);
    res.status(500).json({ message: 'Server error during registration.' });
  }
};

/**
 * @desc    Authenticate user & get token
 * @route   POST /api/auth/login
 * @access  Public
 */
const loginUser = async (req, res) => {
  const { email, password } = req.body;

  // 1. Basic validation
  if (!email || !password) {
    return res.status(400).json({ message: 'Please provide an email and password.' });
  }

  try {
    // 2. Check for user by email
    const [users] = await db.query('SELECT id, name, email, password, role FROM users WHERE email = ?', [email]);

    if (users.length === 0) {
      return res.status(401).json({ message: 'Invalid credentials.' }); // Use a generic message for security
    }

    const user = users[0];

    // 3. Compare passwords
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials.' }); // Same generic message
    }

    // 4. User is valid, create JWT payload
    const payload = {
      user: { id: user.id, name: user.name, role: user.role },
    };

    // 5. Sign the token
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1d' });

    // 6. Respond with token and user info
    res.json({
      message: 'Login successful.',
      token,
      user: { id: user.id, name: user.name, email: user.email, role: user.role },
    });
  } catch (error) {
    console.error('Login Error:', error);
    res.status(500).json({ message: 'Server error during login.' });
  }
};

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

/**
 * @desc    Authenticate user via Google
 * @route   POST /api/auth/google
 * @access  Public
 */
const googleLogin = async (req, res) => {
  const { credential } = req.body; // The token sent from the frontend

  if (!credential) {
    return res.status(400).json({ message: 'Google token is required.' });
  }

  try {
    // 1. Verify the Google token
    const ticket = await client.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    const { name, email, sub: google_id } = ticket.getPayload();

    // 2. Check if user exists in our database
    const [users] = await db.query('SELECT id, name, email, role FROM users WHERE email = ?', [email]);

    let user;

    if (users.length > 0) {
      // User exists, just log them in
      user = users[0];
      // Optional: Update their google_id if they are logging in with Google for the first time
      await db.query('UPDATE users SET google_id = ? WHERE email = ? AND google_id IS NULL', [google_id, email]);
    } else {
      // User does not exist, create a new user
      const [result] = await db.query(
        'INSERT INTO users (name, email, google_id, role) VALUES (?, ?, ?, ?)',
        [name, email, google_id, 'student'] // Default role is student
      );
      user = { id: result.insertId, name, email, role: 'student' };
    }

    // 3. Create our own JWT to manage the session
    const payload = {
      user: { id: user.id, name: user.name, role: user.role },
    };
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1d' });

    // 4. Respond with our token and user info
    res.json({
      message: 'Google login successful.',
      token,
      user: { id: user.id, name: user.name, email: user.email, role: user.role },
    });
  } catch (error) {
    console.error('Google Login Error:', error);
    res.status(401).json({ message: 'Google token is invalid or expired.' });
  }
};

module.exports = {
  registerUser,
  loginUser,
  googleLogin,
};