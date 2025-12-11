const express = require('express');
const router = express.Router();
const { User } = require('../models/User'); 
const { generateToken } = require('../utils/jwtUtils');

// POST /api/auth/signup (Remains unchanged)
router.post('/signup', async (req, res) => {
    try {
        const { email, password, full_name, role, phone } = req.body;
        
        if (!email || !password || !full_name || !role || !phone) {
             return res.status(400).json({ detail: 'All mandatory fields are required.' });
        }

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ detail: 'Email already exists' });
        }

        const userData = { email, password, full_name, role, phone };
        const user = new User(userData);
        await user.save(); 

        const token = generateToken(user); 

        res.status(201).json({
            message: 'Signup successful',
            token: token, 
            role: user.role,
            user_id: user._id.toString(),
            full_name: user.full_name,
        });
    } catch (error) {
        console.error('Signup error:', error);
        res.status(500).json({ detail: 'Server error during signup' });
    }
});

// POST /api/auth/login (UPDATED TO ENFORCE ROLE)
router.post('/login', async (req, res) => {
    try {
        // 🌟 FIX: Capture the submitted role from the frontend payload 🌟
        const { email, password, role: submittedRole } = req.body; 

        // 1. Find the user by email
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(401).json({ detail: 'Invalid credentials.' });
        }

        // 2. Check Password
        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(401).json({ detail: 'Invalid credentials.' });
        }

        // 🌟 FIX 3: Check if the user's actual role matches the submitted role 🌟
        if (user.role !== submittedRole) {
            return res.status(401).json({ detail: `Access denied. Your account is registered as '${user.role}', but you attempted to log in as '${submittedRole}'.` });
        }
        
        // --- If credentials and role match, proceed ---

        const token = generateToken(user); 

        res.json({
            message: 'Login successful',
            token: token, 
            role: user.role,
            full_name: user.full_name,
            user_id: user._id.toString()
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ detail: 'Server error during login' });
    }
});

module.exports = router;