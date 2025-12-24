const express = require('express');
const router = express.Router();
const multer = require('multer');

// Set up storage for uploaded files
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    // Create a unique filename to avoid overwrites
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});

// Create the multer instance
const upload = multer({ storage: storage });


const {
  createFault,
  getMyFaults,
  getAllFaults,
  assignFault,
  updateFaultStatus,
  getAssignedFaults,
  getFaultStats,
  getFaultById,
  getComments,
  addComment,
} = require('../controllers/faultController');
const { protect } = require('../middleware/authMiddleware');
const { adminOnly, employeeOrAdmin, employeeOnly } = require('../middleware/roleMiddleware');

router.post('/', protect, upload.single('image'), createFault);
router.get('/my-faults', protect, getMyFaults);
router.get('/all', protect, adminOnly, getAllFaults);
router.get('/assigned', protect, employeeOnly, getAssignedFaults);
router.get('/stats', protect, adminOnly, getFaultStats);
router.get('/:id', protect, getFaultById);
router.get('/:id/comments', protect, getComments);
router.post('/:id/comments', protect, addComment);
router.put('/:id/assign', protect, adminOnly, assignFault);
router.put('/:id/status', protect, employeeOrAdmin, updateFaultStatus);

module.exports = router;