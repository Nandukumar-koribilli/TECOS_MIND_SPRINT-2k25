// models/Product.js
const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    name: { type: String, required: true },
    description: { type: String },
    category: { type: String, required: true, enum: ['Organic', 'Biological', 'Botanical', 'Chemical'] },
    price: { type: Number, required: true },
    stock_quantity: { type: Number, default: 0 },
    image_url: { type: String },
    created_at: { type: Date, default: Date.now },
});

const Product = mongoose.model('Product', productSchema, 'products');
module.exports = { Product };