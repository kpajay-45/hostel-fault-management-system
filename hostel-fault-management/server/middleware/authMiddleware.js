const jwt = require('jsonwebtoken');
const db = require('../config/db');

const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      // Get token from header
      token = req.headers.authorization.split(' ')[1];

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Get user from the token payload (excluding the password)
      // We attach the user to the request object so we can access it in our routes
      const [users] = await db.query('SELECT id, name, email, role FROM users WHERE id = ?', [decoded.user.id]);
      
      if (users.length === 0) {
        return res.status(401).json({ message: 'Not authorized, user not found' });
      }

      req.user = users[0];
      next();
    } catch (error) {
      console.error(error);
      return res.status(401).json({ message: 'Not authorized, token failed' });
    }
  }

  if (!token) {
    return res.status(401).json({ message: 'Not authorized, no token' });
  }
};

module.exports = { protect };