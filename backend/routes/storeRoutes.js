const express = require('express');
const router = express.Router();
const { Product } = require('../models/Product');
const { Order } = require('../models/Order');
const { User } = require('../models/User'); // Required for populating customer details
const { protect, authorizeRole, roles } = require('../middleware/auth'); 

// NOTE: Ensure your Mongoose schemas (Order and Product) and the User model are correctly
// exported and accessible. Assuming Order model has a 'user_id' field referencing User.

// --- 1. GENERAL/FARMER ROUTES (Product Catalog & Orders) ---

// GET /api/store/products - View Product Catalog (OPEN FOR FARMERS TO SEE)
router.get('/products', async (req, res) => {
    try {
        const products = await Product.find(req.query);
        res.json(products);
    } catch (error) {
        console.error('Error fetching products:', error);
        res.status(500).json({ detail: 'Server error fetching products' });
    }
});

// POST /api/store/orders - Place a new order (Farmer only)
// backend/routes/storeRoutes.js (Inside POST /orders route)

router.post('/orders', protect, authorizeRole(roles.FARMER), async (req, res) => {
    console.log('--- BACKEND DEBUG: START ORDER PLACEMENT ---');
    console.log('User Role:', req.user.role); // 💡 Check 1: Authorization
    
    const { items, total_amount } = req.body;
    
    console.log('Request Body Received:', req.body); // 💡 Check 2: Payload Integrity
    console.log('Items Count (Backend):', items ? items.length : 0); // 💡 Check 3: Items Count

    if (!items || items.length === 0 || total_amount === undefined) {
        // This is the line that keeps triggering!
        return res.status(400).json({ detail: 'Order must contain items and a total amount.' });
    }

    try {
        const orderData = {
            user_id: req.user.id,
            items: items,
            total_amount: total_amount,
            // 💡 Check 4: Does your Order schema require other mandatory fields like 'status'?
            // If status is required but not provided, add a default here:
            // status: 'Pending', 
            created_at: new Date()
        };
        const order = new Order(orderData);
        await order.save();

        console.log('Order Successfully Saved:', order._id);
        res.status(201).json({ message: 'Order placed successfully', orderId: order._id, order: order });
    } catch (error) {
        // 💡 Check 5: Log Mongoose errors (e.g., failed validation)
        console.error('❌ Mongoose/DB Error during Order Save:', error);
        res.status(500).json({ detail: 'Failed to place order due to server error.' });
    }
});
// GET /api/store/orders/user - View user's own orders (FARMER ORDER HISTORY)
router.get('/orders/user', protect, authorizeRole([roles.FARMER, roles.ADMIN]), async (req, res) => {
    console.log(`--- BACKEND TRACE: Fetching Orders for User ID: ${req.user.id} ---`);
    try {
        const userId = req.user.id;
        
        // 🌟 UPDATE: Populate product details (name, price) for farmer's order history 🌟
        const orders = await Order.find({ user_id: userId })
            .sort({ created_at: -1 })
            .populate('items.product_id', 'name price image_url'); // Select only needed fields
            
        console.log(`Found ${orders.length} orders for the authenticated user.`);
        
        res.json(orders);
    } catch (error) {
        console.error('❌ Error fetching user orders:', error);
        res.status(500).json({ detail: 'Server error fetching orders' });
    }
});

// --------------------------------------------------------------------------

// --- 2. LANDOWNER/ADMIN ROUTES (Product CRUD and Order Management) ---

// GET /api/store/orders/all - View ALL Orders (LANDOWNER ORDER MANAGEMENT)
router.get('/orders/all', protect, authorizeRole([roles.LANDOWNER, roles.ADMIN]), async (req, res) => {
    console.log('--- BACKEND TRACE: Fetching ALL Store Orders for Landowner ---');
    try {
        // 🌟 NEW UPDATE: Populate customer (User) details and product details 🌟
        const orders = await Order.find({})
            .sort({ created_at: -1 })
            // Populate the 'user_id' field to get customer details
            .populate('user_id', 'full_name phone email address') // Get customer contact/address
            // Populate product details for the items array
            .populate('items.product_id', 'name price'); 
            
        console.log(`Found ${orders.length} total orders for management.`);
        res.json(orders);
    } catch (error) {
        console.error('❌ Error fetching all orders for management:', error);
        res.status(500).json({ detail: 'Server error fetching all orders' });
    }
});

// POST /api/store/products/admin - Create Product (LANDOWNER ACCESS)
router.post('/products/admin', protect, authorizeRole([roles.LANDOWNER, roles.ADMIN]), async (req, res) => {
    try {
        const product = new Product(req.body);
        await product.save();
        res.status(201).json(product);
    } catch (error) {
        console.error('Create product error:', error);
        const detail = error.errors ? Object.keys(error.errors).map(key => error.errors[key].message).join(', ') : 'Could not create product';
        res.status(400).json({ detail: detail });
    }
});
// PUT /api/store/products/admin/:id - Update Product (LANDOWNER ACCESS)
router.put('/products/admin/:id', protect, authorizeRole([roles.LANDOWNER, roles.ADMIN]), async (req, res) => {
    try {
        req.body.updated_at = new Date();
        const updatedProduct = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });

        if (!updatedProduct) return res.status(404).json({ detail: 'Product not found.' });

        res.json(updatedProduct);
    } catch (error) {
        console.error('Update product error:', error);
        const detail = error.errors ? Object.keys(error.errors).map(key => error.errors[key].message).join(', ') : 'Could not update product';
        res.status(400).json({ detail: detail });
    }
});

// DELETE /api/store/products/admin/:id - Delete Product (LANDOWNER ACCESS)
router.delete('/products/admin/:id', protect, authorizeRole([roles.LANDOWNER, roles.ADMIN]), async (req, res) => {
    try {
        const deletedProduct = await Product.findByIdAndDelete(req.params.id);

        if (!deletedProduct) return res.status(404).json({ detail: 'Product not found.' });

        res.status(204).send();
    } catch (error) {
        console.error('Delete product error:', error);
        res.status(500).json({ detail: 'Could not delete product' });
    }
});


module.exports = router;