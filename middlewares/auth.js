const jwt = require('jsonwebtoken');
const config = require('../config');
const ResponseFormat = require('../responseFormat');

const authorizeUser = (req, res, next) => {
    const token = req.header('x-auth-token');
    if (!token) {
        // return res.status(401).json({ message: 'Access denied. No token provided.' });
        return res.status(401).json(ResponseFormat(false, "Access denied. No token provided..."));
    }
    try {
        const decoded = jwt.verify(token, config.secretKey);
        req.user = decoded;
        next();
    } catch (ex) {
        // res.status(400).json({ message: 'Invalid token.' });
         res.status(401).json(ResponseFormat(false, "Invalid token..."));
    }
}

module.exports = authorizeUser;