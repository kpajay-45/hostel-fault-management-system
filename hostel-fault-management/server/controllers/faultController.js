const db = require('../config/db');
const sendEmail = require('../utils/emailService');
const axios = require('axios');

const getFaultDetailsQuery = `
  SELECT
    f.id, f.user_id, f.assigned_to_id, f.location, f.description, f.category, f.status, f.priority, f.hostel_name, f.floor, f.image_url, f.created_at, f.updated_at,
    reporter.name as reporter_name,
    reporter.room_number as reporter_room,
    employee.name as assigned_employee_name
  FROM faults f
  JOIN users reporter ON f.user_id = reporter.id
  LEFT JOIN users employee ON f.assigned_to_id = employee.id
  WHERE f.id = ?
`;


/**
 * @desc    Create a new fault report
 * @route   POST /api/faults
 * @access  Private
 */
const createFault = async (req, res) => {
  const { description, location, hostel_name, floor } = req.body;
  const userId = req.user.id; // We get this from the 'protect' middleware
  const imageUrl = req.file ? `/uploads/${req.file.filename}` : null;

  if (!description || !location || !hostel_name || !floor) {
    return res.status(400).json({ message: 'Please fill out all required fields.' });
  }

  try {
    let priority = 'Low'; // Default priority
    let category = 'General'; // Default category

    // Call the ML service to get priority and category
    try {
      const mlResponse = await axios.post('http://localhost:8000/predict', {
        description: description,
      });
      priority = mlResponse.data.priority;
      category = mlResponse.data.category;
    } catch (mlError) {
      console.error('ML service call failed, using default values:', mlError.message);
      // If the ML service fails, we still proceed but log the error.
    }

    const [result] = await db.query(
      'INSERT INTO faults (user_id, description, location, priority, category, hostel_name, floor, image_url) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [userId, description, location, priority, category, hostel_name, floor, imageUrl]
    );

    // --- Emit new_fault event via WebSocket ---
    const [newlyCreatedFault] = await db.query(getFaultDetailsQuery, [result.insertId]);
    if (newlyCreatedFault.length > 0) {
      req.io.emit('new_fault', newlyCreatedFault[0]);
    }

    // --- Send Notification Email to Admins ---
    const [admins] = await db.query("SELECT email FROM users WHERE role = 'admin'");
    if (admins.length > 0) {
      const subject = `New Fault Submitted: #${result.insertId}`;
      const text = `A new fault has been submitted.\n\nReport ID: ${result.insertId}\nLocation: ${location}\nDescription: ${description}\n\nPlease log in to the admin dashboard to assign it.`;
      // Send email to all admins
      admins.forEach(admin => {
        sendEmail(admin.email, subject, text);
      });
    }

    res.status(201).json({
      message: 'Fault report submitted successfully.',
      faultId: result.insertId,
    });
  } catch (error) {
    console.error('Fault Creation Error:', error);
    res.status(500).json({ message: 'Server error while creating fault report.' });
  }
};

/**
 * @desc    Get all faults submitted by the logged-in user
 * @route   GET /api/faults/my-faults
 * @access  Private
 */
const getMyFaults = async (req, res) => {
  const userId = req.user.id; // From our 'protect' middleware

  try {
    const [faults] = await db.query(
      'SELECT id, location, description, category, status, priority, hostel_name, floor, image_url, created_at FROM faults WHERE user_id = ? ORDER BY created_at DESC',
      [userId]
    );

    res.json(faults);
  } catch (error) {
    console.error('Get My Faults Error:', error);
    res.status(500).json({ message: 'Server error while fetching faults.' });
  }
};

/**
 * @desc    Get all faults (Admin only)
 * @route   GET /api/faults/all
 * @access  Private/Admin
 */
const getAllFaults = async (req, res) => {
  try {
    // We use a JOIN to get the name of the user who reported the fault
    const [faults] = await db.query(
      `SELECT
        f.id, f.user_id, f.location, f.description, f.category, f.status, f.priority, f.hostel_name, f.floor, f.image_url, f.created_at,
        u.name as reporter_name 
       FROM faults f
       JOIN users u ON f.user_id = u.id
       ORDER BY f.created_at DESC`
    );

    res.json(faults);
  } catch (error) {
    console.error('Get All Faults Error:', error);
    res.status(500).json({ message: 'Server error while fetching all faults.' });
  }
};

/**
 * @desc    Automatically assign a fault to the least busy, specialized employee (Admin only)
 * @route   PUT /api/faults/:id/assign
 * @access  Private/Admin
 */
const assignFault = async (req, res) => {
  const { id: faultId } = req.params;

  try {
    // 1. Get the fault's category and ensure it's not already assigned
    const [faults] = await db.query("SELECT category, status, description, location FROM faults WHERE id = ? AND status = 'Submitted'", [faultId]);
    if (faults.length === 0) {
      return res.status(404).json({ message: 'Fault not found or is already assigned.' });
    }
    const faultDetails = faults[0];
    const faultCategory = faultDetails.category;

    // 2. Find all employees specialized in this category and count their current open tasks
    const [specializedEmployees] = await db.query(
      `SELECT u.id, u.email, COUNT(f.id) as open_tasks
       FROM users u
       JOIN employee_specializations es ON u.id = es.user_id
       LEFT JOIN faults f ON u.id = f.assigned_to_id AND f.status IN ('Submitted', 'In Progress')
       WHERE u.role = 'employee' AND es.category = ?
       GROUP BY u.id, u.email
       ORDER BY open_tasks ASC`,
      [faultCategory]
    );

    if (specializedEmployees.length === 0) {
      return res.status(404).json({ message: `No available employees found for the '${faultCategory}' category.` });
    }

    // 3. The first employee in the sorted list is the least busy
    const bestEmployee = specializedEmployees[0];
    const employeeId = bestEmployee.id;
    const employeeEmail = bestEmployee.email;

    // 4. Assign the fault, set status to 'In Progress', and update the timestamp
    await db.query("UPDATE faults SET assigned_to_id = ?, status = 'In Progress', updated_at = NOW() WHERE id = ?", [employeeId, faultId]);

    // --- Emit fault_updated event via WebSocket ---
    const [updatedFault] = await db.query(getFaultDetailsQuery, [faultId]);
    if (updatedFault.length > 0) {
      req.io.emit('fault_updated', updatedFault[0]);
    }

    // 5. Send email notification to the employee
    const subject = `New Task Assigned: Fault #${faultId}`;
    const text = `Hello, a new fault has been assigned to you.\n\nID: ${faultId}\nLocation: ${faultDetails.location}\nDescription: ${faultDetails.description}\n\nPlease log in to the dashboard to view details.`;
    sendEmail(employeeEmail, subject, text);

    res.json({ message: `Fault #${faultId} automatically assigned to employee #${employeeId}.` });
  } catch (error) {
    console.error('Assign Fault Error:', error);
    res.status(500).json({ message: 'Server error while assigning fault.' });
  }
};

/**
 * @desc    Update a fault's status (Employee or Admin)
 * @route   PUT /api/faults/:id/status
 * @access  Private/EmployeeOrAdmin
 */
const updateFaultStatus = async (req, res) => {
  const { status } = req.body;
  const { id: faultId } = req.params;

  // Validate the status
  const allowedStatuses = ['Submitted', 'In Progress', 'Resolved', 'Rejected'];
  if (!status || !allowedStatuses.includes(status)) {
    return res.status(400).json({ message: `Invalid status. Must be one of: ${allowedStatuses.join(', ')}` });
  }

  try {
    // Check if fault exists and get the reporter's user_id
    const [faults] = await db.query('SELECT user_id FROM faults WHERE id = ?', [faultId]);
    if (faults.length === 0) {
      return res.status(404).json({ message: 'Fault not found.' });
    }

    // Update the fault status and the updated_at timestamp
    await db.query('UPDATE faults SET status = ?, updated_at = NOW() WHERE id = ?', [status, faultId]);

    // --- Emit fault_updated event via WebSocket ---
    const [updatedFault] = await db.query(getFaultDetailsQuery, [faultId]);
    if (updatedFault.length > 0) {
      req.io.emit('fault_updated', updatedFault[0]);
    }

    // --- Send Email Notifications on Resolution ---
    if (status === 'Resolved') {
      // Notify the student who reported the fault
      const [users] = await db.query('SELECT email FROM users WHERE id = ?', [faults[0].user_id]);
      if (users.length > 0) {
        const reporterEmail = users[0].email;
        const subject = `Your Fault Report #${faultId} has been Resolved`;
        const text = `Hello, the status of your fault report #${faultId} has been updated to: ${status}.\n\nThank you for your patience.`;
        sendEmail(reporterEmail, subject, text);
      }

      // Notify all admins that the fault has been resolved
      const [admins] = await db.query("SELECT email FROM users WHERE role = 'admin'");
      if (admins.length > 0) {
        const subject = `Fault #${faultId} has been Resolved`;
        const text = `The fault report #${faultId} has been marked as 'Resolved'.`;
        admins.forEach(admin => {
          sendEmail(admin.email, subject, text);
        });
      }
    }

    res.json({ message: `Fault #${faultId} status updated to '${status}'.` });
  } catch (error) {
    console.error('Update Status Error:', error);
    res.status(500).json({ message: 'Server error while updating fault status.' });
  }
};

/**
 * @desc    Get all faults assigned to the logged-in employee
 * @route   GET /api/faults/assigned
 * @access  Private/Employee
 */
const getAssignedFaults = async (req, res) => {
  const employeeId = req.user.id; // From our 'protect' middleware

  try {
    const [faults] = await db.query(
      `SELECT
        f.id, f.user_id, f.assigned_to_id, f.location, f.description, f.category, f.status, f.priority, f.hostel_name, f.floor, f.image_url, f.created_at,
        u.name as reporter_name, u.room_number as reporter_room
       FROM faults f
       JOIN users u ON f.user_id = u.id
       WHERE f.assigned_to_id = ?
       ORDER BY f.created_at DESC`,
      [employeeId]
    );

    res.json(faults);
  } catch (error) {
    console.error('Get Assigned Faults Error:', error);
    res.status(500).json({ message: 'Server error while fetching assigned faults.' });
  }
};

/**
 * @desc    Get fault statistics (Admin only)
 * @route   GET /api/faults/stats
 * @access  Private/Admin
 */
const getFaultStats = async (req, res) => {
  try {
    const [statusCounts] = await db.query(
      "SELECT status, COUNT(*) as count FROM faults GROUP BY status"
    );

    const [priorityCounts] = await db.query(
      "SELECT priority, COUNT(*) as count FROM faults GROUP BY priority"
    );

    const [categoryCounts] = await db.query(
      "SELECT category, COUNT(*) as count FROM faults GROUP BY category"
    );

    res.json({
      statusCounts,
      priorityCounts,
      categoryCounts,
    });
  } catch (error) {
    console.error('Get Fault Stats Error:', error);
    res.status(500).json({ message: 'Server error while fetching fault statistics.' });
  }
};

/**
 * @desc    Get a single fault by ID
 * @route   GET /api/faults/:id
 * @access  Private
 */
const getFaultById = async (req, res) => {
  const { id: faultId } = req.params;
  try {
    const [faults] = await db.query(getFaultDetailsQuery, [faultId]);
    if (faults.length === 0) {
      return res.status(404).json({ message: 'Fault not found.' });
    }
    res.json(faults[0]);
  } catch (error) {
    console.error('Get Fault By ID Error:', error);
    res.status(500).json({ message: 'Server error while fetching fault.' });
  }
};

/**
 * @desc    Get all comments for a fault
 * @route   GET /api/faults/:id/comments
 * @access  Private
 */
const getComments = async (req, res) => {
  const { id: faultId } = req.params;
  try {
    const [comments] = await db.query(
      `SELECT c.id, c.comment, c.created_at, u.name as author_name, u.role as author_role 
       FROM fault_comments c
       JOIN users u ON c.user_id = u.id
       WHERE c.fault_id = ? 
       ORDER BY c.created_at ASC`,
      [faultId]
    );
    res.json(comments);
  } catch (error) {
    console.error('Get Comments Error:', error);
    res.status(500).json({ message: 'Server error while fetching comments.' });
  }
};

/**
 * @desc    Add a comment to a fault
 * @route   POST /api/faults/:id/comments
 * @access  Private
 */
const addComment = async (req, res) => {
  const { id: faultId } = req.params;
  const { comment } = req.body;
  const userId = req.user.id;

  if (!comment) {
    return res.status(400).json({ message: 'Comment text cannot be empty.' });
  }

  try {
    const [result] = await db.query('INSERT INTO fault_comments (fault_id, user_id, comment) VALUES (?, ?, ?)', [faultId, userId, comment]);
    const [newComment] = await db.query(`SELECT c.id, c.comment, c.created_at, u.name as author_name, u.role as author_role FROM fault_comments c JOIN users u ON c.user_id = u.id WHERE c.id = ?`, [result.insertId]);
    req.io.emit('new_comment', { faultId: parseInt(faultId), comment: newComment[0] });
    res.status(201).json(newComment[0]);
  } catch (error) {
    console.error('Add Comment Error:', error);
    res.status(500).json({ message: 'Server error while adding comment.' });
  }
};

module.exports = { createFault, getMyFaults, getAllFaults, assignFault, updateFaultStatus, getAssignedFaults, getFaultStats, getFaultById, getComments, addComment };