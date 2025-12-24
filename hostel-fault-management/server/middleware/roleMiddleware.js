/**
 * Middleware to check if the user is an admin.
 * This should be used AFTER the 'protect' middleware.
 */
const adminOnly = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({ message: 'Forbidden. Admin access required.' });
  }
};

/**
 * Middleware to check if the user is an employee.
 */
const employeeOnly = (req, res, next) => {
  if (req.user && req.user.role === 'employee') {
    next();
  } else {
    res.status(403).json({ message: 'Forbidden. Employee access required.' });
  }
};

/**
 * Middleware to check if the user is an employee OR an admin.
 */
const employeeOrAdmin = (req, res, next) => {
  if (req.user && (req.user.role === 'employee' || req.user.role === 'admin')) {
    next();
  } else {
    res.status(403).json({ message: 'Forbidden. Employee or Admin access required.' });
  }
};

module.exports = {
  adminOnly,
  employeeOnly,
  employeeOrAdmin,
};