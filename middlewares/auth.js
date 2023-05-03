const jwt = require('jsonwebtoken');
const config = require('../config');
const ResponseFormat = require('../responseFormat');

const authorizeUser = (req, res, next) => {
    const token = req.header('x-auth-token');
    if (!token) {
        return res.status(401).json(ResponseFormat(false, "Access denied. No token provided..."));
    }
    try {
        const decoded = jwt.verify(token, config.secretKey);
        req.user = decoded;
        next();
    } catch (ex) {
         res.status(401).json(ResponseFormat(false, "Invalid token..."));
    }
}

module.exports = authorizeUser;