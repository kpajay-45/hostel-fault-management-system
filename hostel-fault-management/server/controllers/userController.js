const db = require('../config/db');

const getEmployees = async (req, res) => {
  try {
    const [employees] = await db.query("SELECT id, name FROM users WHERE role = 'employee'");
    res.json(employees);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

const getAllUsers = async (req, res) => {
  try {
    const [users] = await db.query(`
      SELECT 
        u.id, u.name, u.email, u.role, u.room_number,
        COUNT(f.id) as total_assigned,
        SUM(CASE WHEN f.status = 'Resolved' THEN 1 ELSE 0 END) as resolved_count,
        SUM(CASE WHEN f.status = 'In Progress' THEN 1 ELSE 0 END) as pending_count
      FROM users u
      LEFT JOIN faults f ON u.id = f.assigned_to_id
      GROUP BY u.id, u.name, u.email, u.role, u.room_number
      ORDER BY u.created_at DESC
    `);
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

const updateUserRole = async (req, res) => {
  const { role } = req.body;
  const { id } = req.params;
  try {
    await db.query('UPDATE users SET role = ? WHERE id = ?', [role, id]);
    res.json({ message: 'User role updated' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

const deleteUser = async (req, res) => {
  const { id } = req.params;
  try {
    await db.query('DELETE FROM users WHERE id = ?', [id]);
    res.json({ message: 'User deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

const getMe = async (req, res) => {
  try {
    const [users] = await db.query('SELECT id, name, email, room_number FROM users WHERE id = ?', [req.user.id]);
    res.json(users[0]);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

const updateMe = async (req, res) => {
  const { name, roll_number } = req.body;
  try {
    await db.query('UPDATE users SET name = ?, roll_number = ? WHERE id = ?', [name, roll_number, req.user.id]);
    res.json({ message: 'Profile updated successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { getEmployees, getAllUsers, updateUserRole, deleteUser, getMe, updateMe };