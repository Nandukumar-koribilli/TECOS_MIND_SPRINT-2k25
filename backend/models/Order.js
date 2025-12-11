// models/Order.js

// 🌟 FIX: Import mongoose at the beginning of the file 🌟
const mongoose = require('mongoose'); 

const orderSchema = new mongoose.Schema({
    user_id: { type: String, required: true },
    items: [
        {
            // Reference to Product model
            product_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
            quantity: { type: Number, required: true },
            price_at_purchase: { type: Number, required: true }
        }
    ],
    total_amount: { type: Number, required: true },
    status: { type: String, default: 'Pending', enum: ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'] },
    created_at: { type: Date, default: Date.now },
});

const Order = mongoose.model('Order', orderSchema, 'orders');
module.exports = { Order };