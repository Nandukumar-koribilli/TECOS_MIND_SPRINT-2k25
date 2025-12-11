const express = require('express');
const router = express.Router();
const { User } = require('../models/User');
const { protect, authorizeRole, roles } = require('../middleware/auth');

// Apply JWT protection and Admin role authorization to ALL routes
router.use(protect);
router.use(authorizeRole(roles.ADMIN));

// GET /api/admin/users - Get all users
router.get('/users', async (req, res) => {
    try {
        const users = await User.find().select('-password');
        res.json(users);
    } catch (error) {
        res.status(500).json({ detail: 'Server error fetching all users' });
    }
});

// DELETE /api/admin/users/:user_id - Delete a user
router.delete('/users/:user_id', async (req, res) => {
    try {
        const result = await User.findByIdAndDelete(req.params.user_id);
        if (!result) return res.status(404).json({ detail: 'User not found.' });
        res.json({ message: 'User deleted successfully' });
    } catch (error) {
        res.status(500).json({ detail: 'Failed to delete user' });
    }
});

// POST /api/admin/products - Add a new product to the store
router.post('/products', async (req, res) => {
    try {
        // Assume you've imported Product model
        // const product = new Product(req.body);
        // await product.save();
        res.status(201).json({ message: 'Product added (Requires Product Model implementation)' });
    } catch (error) {
        res.status(500).json({ detail: 'Failed to add product' });
    }
});

module.exports = router;