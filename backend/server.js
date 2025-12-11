const express = require('express');
const cors = require('cors');
require('dotenv').config();
const connectDB = require('./config/db');

// 1. Import Routes
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const landRoutes = require('./routes/landRoutes');
const storeRoutes = require('./routes/storeRoutes');
const adminRoutes = require('./routes/adminRoutes');

// 2. Setup
const app = express();
connectDB(); // Execute DB connection

// 3. Middleware
app.use(cors());
app.use(express.json()); // For parsing application/json

// 4. Route Mounting
app.use('/api/auth', authRoutes);     // Public (Signup/Login)
app.use('/api/profile', userRoutes);  // Protected (Profile CRUD)
app.use('/api/lands', landRoutes);    // Protected/Public (Land management/browsing)
app.use('/api/store', storeRoutes);   // Protected (Store/Orders)
app.use('/api/admin', adminRoutes);   // STRICTLY Protected (Admin panel)

// Health Check
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', message: 'Smart Kisan MERN Backend is running!' });
});

// 5. Start Server
const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
});