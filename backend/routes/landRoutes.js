const express = require('express');
const router = express.Router();
const { Land } = require('../models/Land');
const { protect, isLandownerOrAdmin, isFarmerOrAdmin } = require('../middleware/auth'); // Assuming you have all necessary middleware

// GET /api/lands - View all available lands (Open to farmers/public browsing)
router.get('/', async (req, res) => {
    console.log('--- BACKEND TRACE: Fetching ALL Available Lands ---');
    try {
        // This is the query used by the Farmer Dashboard and public browsing
        const lands = await Land.find({ status: 'available' }); 
        
        console.log(`Found ${lands.length} available lands.`);
        res.json(lands);
    } catch (error) {
        console.error('❌ Fetch ALL Lands Error:', error);
        res.status(500).json({ detail: 'Server error fetching lands' });
    }
});

// POST /api/lands - Create Land (Landowner/Admin only)
router.post('/', protect, isLandownerOrAdmin, async (req, res) => {
    console.log('--- BACKEND TRACE: Land Creation Received ---');
    console.log('Authenticated User ID:', req.user.id);
    console.log('Incoming Payload:', req.body);
    
    try {
        // Set the owner_id from the authenticated user's token payload
        const landData = { ...req.body, owner_id: req.user.id };
        const land = new Land(landData);
        await land.save();

        console.log('✅ Land Saved Successfully. ID:', land._id.toString());
        res.status(201).json(land);
    } catch (error) {
        console.error('❌ Land Creation Error:', error);
        res.status(500).json({ detail: 'Could not create land listing', error: error.message });
    }
});

// GET /api/lands/user/:userId (Fetch User Specific Lands)
router.get('/user/:userId', protect, isLandownerOrAdmin, async (req, res) => {
    console.log('--- BACKEND TRACE: Fetching User Lands ---');
    try {
        const userId = req.params.userId;
        const lands = await Land.find({ owner_id: userId });
        
        console.log(`Found ${lands.length} lands for user ${userId}.`);
        res.json(lands);
    } catch (error) {
        console.error('❌ Fetch User Lands Error:', error);
        res.status(500).json({ detail: 'Server error fetching user lands' });
    }
});

// PUT /api/lands/:land_id - Update Land (Landowner/Admin only)
router.put('/:land_id', protect, isLandownerOrAdmin, async (req, res) => {
    console.log('--- BACKEND TRACE: Land Update Requested ---');
    try {
        const land = await Land.findById(req.params.land_id);
        if (!land) return res.status(404).json({ detail: 'Land not found.' });
        
        // Individual-Based Check: User must own the land OR be an Admin
        if (land.owner_id.toString() !== req.user.id && req.user.role !== 'admin') {
            console.log('❌ Update Denied: Owner mismatch.');
            return res.status(403).json({ detail: 'Not authorized to update this land.' });
        }
        
        req.body.updated_at = new Date().toISOString();
        const updatedLand = await Land.findByIdAndUpdate(req.params.land_id, req.body, { new: true });
        console.log('✅ Land Updated Successfully. ID:', req.params.land_id);
        res.json(updatedLand);
    } catch (error) {
        console.error('❌ Update land error:', error);
        res.status(500).json({ detail: 'Could not update land' });
    }
});

// DELETE /api/lands/:land_id
router.delete('/:land_id', protect, isLandownerOrAdmin, async (req, res) => {
    console.log('--- BACKEND TRACE: Land Deletion Requested ---');
    try {
        const land = await Land.findById(req.params.land_id);
        
        if (!land) return res.status(404).json({ detail: 'Land not found.' });

        if (land.owner_id.toString() !== req.user.id && req.user.role !== 'admin') {
            console.log('❌ Deletion Denied: Owner mismatch.');
            return res.status(403).json({ detail: 'Not authorized to delete this land.' });
        }

        await Land.findByIdAndDelete(req.params.land_id);
        console.log('✅ Land Deleted Successfully. ID:', req.params.land_id);
        res.status(204).send(); 

    } catch (error) {
        console.error('❌ Delete land error:', error);
        res.status(500).json({ detail: 'Could not delete land' });
    }
});

module.exports = router;