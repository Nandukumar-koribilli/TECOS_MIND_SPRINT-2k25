const mongoose = require('mongoose');
const addressSchema = require('./Address');

const landSchema = new mongoose.Schema({
    owner_id: { type: String, required: true },
    title: { type: String, required: true },
    description: { type: String },
    
    location: { type: addressSchema, required: true }, // Structured location
    
    area: { type: Number, required: true },
    price_per_acre: { type: Number },
    soil_type: { type: String },
    water_availability: { type: String, enum: ['high', 'medium', 'low', 'seasonal'] },
    status: { type: String, default: 'available', enum: ['available', 'rented', 'maintenance'] },
    created_at: { type: String, default: () => new Date().toISOString() },
    updated_at: { type: String, default: () => new Date().toISOString() }
});

// CRITICAL: Index the GeoJSON field for spatial queries
landSchema.index({ 'location.coordinates.values': '2dsphere' });

const Land = mongoose.model('Land', landSchema, 'lands');
module.exports = { Land };