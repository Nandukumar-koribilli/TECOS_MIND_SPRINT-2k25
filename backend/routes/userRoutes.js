const express = require('express');
const router = express.Router();
const { User } = require('../models/User');
const { protect } = require('../middleware/auth');

// Middleware to ensure user is logged in
router.use(protect); 

// GET /api/profile/:user_id - Get user profile
router.get('/:user_id', async (req, res) => {
    // 🌟 FIX: Allow ANY authenticated user to view ANY profile 🌟
    // NOTE: We rely on the .select('-password') below to prevent leaking sensitive credentials.
    
    try {
        // Fetch user profile, excluding the password field
        const user = await User.findById(req.params.user_id).select('-password');
        if (!user) return res.status(404).json({ detail: 'User not found' });
        
        // OPTIONAL: If you want to explicitly hide the email address from non-admins 
        // who are viewing another user's profile:
        /*
        const userObj = user.toObject();
        if (req.user.id !== req.params.user_id && req.user.role !== 'admin') {
            userObj.email = 'Hidden for contact privacy';
        }
        res.json(userObj);
        */
        
        res.json(user);
    } catch (error) {
        console.error('Server error fetching profile:', error);
        res.status(500).json({ detail: 'Server error fetching profile' });
    }
});

// PUT /api/profile/:user_id - Update user profile (Self only)
router.put('/:user_id', async (req, res) => {
    // User can only update their own profile (Strict Self-view required)
    if (req.user.id !== req.params.user_id) {
        return res.status(403).json({ detail: 'Not authorized to update this profile.' });
    }

    try {
        const updates = req.body;
        updates.updated_at = new Date().toISOString();
        
        // Prevent critical field changes through this route
        delete updates.role;
        delete updates.email;
        delete updates.password;

        const updatedUser = await User.findByIdAndUpdate(
            req.params.user_id, 
            { $set: updates }, 
            { new: true, runValidators: true } // Run validators for structured address
        ).select('-password');

        if (!updatedUser) return res.status(404).json({ detail: 'Profile not found' });
        
        res.json(updatedUser);
    } catch (error) {
        console.error('Update profile error:', error);
        res.status(500).json({ detail: 'Server error during profile update' });
    }
});

module.exports = router;