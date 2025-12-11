const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET;

const roles = {
    ADMIN: 'admin',
    LANDOWNER: 'landowner',
    FARMER: 'farmer'
};

// 1. Authentication Middleware: Verifies the JWT (No Change)
const protect = (req, res, next) => {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            token = req.headers.authorization.split(' ')[1];
            const decoded = jwt.verify(token, JWT_SECRET);
            // Assuming the JWT payload has { id: ..., role: 'landowner' }
            req.user = decoded; 
            return next();
        } catch (error) {
            return res.status(401).json({ detail: 'Not authorized, invalid token' });
        }
    }

    if (!token) {
        return res.status(401).json({ detail: 'Not authorized, no token provided' });
    }
};

// 2. 🌟 CORRECTED AUTHORIZATION MIDDLEWARE: Handles Arrays of Roles 🌟
const authorizeRole = (allowedRoles) => {
    // Ensure allowedRoles is always an array for safety
    const normalizedAllowedRoles = Array.isArray(allowedRoles) ? 
        allowedRoles.map(r => r.toLowerCase()) : 
        [allowedRoles].map(r => r.toLowerCase());

    return (req, res, next) => {
        if (!req.user || !req.user.role) {
            return res.status(401).json({ detail: 'Unauthorized. Role missing.' });
        }
        
        const userRole = req.user.role.toLowerCase();
        
        // Check if the user's role is included in the list of allowed roles
        if (normalizedAllowedRoles.includes(userRole)) {
            next(); // Authorization successful
        } else {
            const roleList = normalizedAllowedRoles.join(', ');
            return res.status(403).json({ detail: `Forbidden. Must be one of: ${roleList}` });
        }
    };
};


// 3. Simplified/Removed Authorization Helpers (We will use authorizeRole directly)
/* NOTE: isLandownerOrAdmin and isFarmerOrAdmin are no longer needed 
   in their old form, but we can update them to use the new authorizeRole. */

const isLandownerOrAdmin = authorizeRole([roles.LANDOWNER, roles.ADMIN]);
const isFarmerOrAdmin = authorizeRole([roles.FARMER, roles.ADMIN]);


module.exports = {
    protect, 
    authorizeRole,
    isLandownerOrAdmin, // Now fixed to use the new authorizeRole
    isFarmerOrAdmin,    // Now fixed to use the new authorizeRole
    roles
};