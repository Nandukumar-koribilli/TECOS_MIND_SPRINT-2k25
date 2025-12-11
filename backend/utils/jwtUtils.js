const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRATION = '7d';

const generateToken = (user) => {
    const payload = {
        id: user._id,
        role: user.role,
        email: user.email
    };

    return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRATION });
};

module.exports = { generateToken };