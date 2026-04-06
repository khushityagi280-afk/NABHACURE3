const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const apiRoutes = require('./routes/api');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Database connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/nabhacure';
mongoose.set('bufferCommands', false); // Disable buffering globally if DB is not connected

mongoose.connect(MONGODB_URI, {
  serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of 30s
})
  .then(() => console.log('MongoDB connected successfully'))
  .catch(err => {
    console.error('MongoDB connection error. Please make sure MongoDB is running or MONGODB_URI is correct.');
    console.error('Current URI:', MONGODB_URI.split('@').pop()); // Log only host for security
  });

// Routes
app.use('/api', apiRoutes);

// Error Handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(5000).json({ error: 'Something went wrong!', details: err.message });
});

// Start Server
app.listen(PORT, '127.0.0.1', () => {
  console.log(`Server is running on http://127.0.0.1:${PORT}`);
});

// Keep process alive
setInterval(() => {}, 1000);
