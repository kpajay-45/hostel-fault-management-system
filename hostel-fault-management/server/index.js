// Import required packages
const express = require('express');
const http = require('http');
const { Server } = require("socket.io");
const cors = require('cors');
const authRoutes = require('./routes/authRoutes'); // Import auth routes
const userRoutes = require('./routes/userRoutes'); // Import user routes
const path = require('path');
const faultRoutes = require('./routes/faultRoutes'); // Import fault routes
const db = require('./config/db'); // Import the database connection pool
require('dotenv').config(); // Load environment variables from .env file

// Create an Express application
const app = express();
const httpServer = http.createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: "http://localhost:3000", // Allow your React app's origin
    methods: ["GET", "POST"]
  }
});

// Define the port
// Use the port from environment variables or default to 5000
const PORT = process.env.PORT || 5000;

// --- Middlewares ---
// Middleware to attach io to each request so controllers can use it
app.use((req, res, next) => {
  req.io = io;
  next();
});
// Enable CORS for all routes to allow frontend to connect
app.use(cors());
// Enable parsing of JSON in request bodies
app.use(express.json());

// --- Socket.IO Connection ---
io.on('connection', (socket) => {
  console.log(`✅ User connected with socket id: ${socket.id}`);
  socket.on('disconnect', () => {
    console.log(`❌ User disconnected: ${socket.id}`);
  });
});

// Serve static files from the 'uploads' directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// --- Routes ---
// A simple test route to make sure the server is running
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to the Hostel Fault Management API!' });
});

// Mount the authentication routes
app.use('/api/auth', authRoutes);

// Mount the user routes
app.use('/api/users', userRoutes);

// Mount the fault routes
app.use('/api/faults', faultRoutes);

// --- Database Connection Test ---
const checkDbConnection = async () => {
  try {
    await db.query('SELECT 1');
    console.log('✅ Database connection successful.');
  } catch (error) {
    console.error('❌ Database connection failed:', error);
  }
};

// --- Server ---
// Start the server and listen on the specified port
httpServer.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
  checkDbConnection(); // Check DB connection when server starts
});