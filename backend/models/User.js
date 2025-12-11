const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const addressSchema = require('./Address');
const SALT_ROUNDS = 10; 

const userSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    full_name: { type: String, required: true },
    role: { type: String, required: true, enum: ['farmer', 'landowner', 'admin'] },
    phone: { type: String, required: true }, // Mandatory
    
    address: { type: addressSchema, required: false }, // Optional at signup
    
    created_at: { type: String, default: () => new Date().toISOString() },
    updated_at: { type: String, default: () => new Date().toISOString() }
});

userSchema.pre('save', async function(next) {
    if (this.isModified('password') || this.isNew) {
        const salt = await bcrypt.genSalt(SALT_ROUNDS);
        this.password = await bcrypt.hash(this.password, salt);
    }
    next();
});

userSchema.methods.comparePassword = function(password) {
    return bcrypt.compare(password, this.password);
};

const User = mongoose.model('User', userSchema, 'users');
module.exports = { User };