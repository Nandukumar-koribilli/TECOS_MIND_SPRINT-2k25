const mongoose = require('mongoose');

const addressSchema = new mongoose.Schema({
    street_address: { type: String, required: true },
    city: { type: String, required: true },
    state_province: { type: String, required: true },
    postal_code: { type: String, required: true },
    country: { type: String, default: 'India', required: true }, 

    // GeoJSON Point for MongoDB indexing and search
    coordinates: {
        type: {
            type: String,
            enum: ['Point'],
            default: 'Point',
            required: true
        },
        values: {
            type: [Number], // [longitude, latitude]
            required: true, 
            validate: {
                validator: function(v) { return v && v.length === 2; },
                message: 'Coordinates must be an array of [longitude, latitude].'
            }
        }
    },
    
    landmark: { type: String },
    parcel_id: { type: String }, 
}, { _id: false });

module.exports = addressSchema;