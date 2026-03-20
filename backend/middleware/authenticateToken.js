const jwt = require('jsonwebtoken');
require('dotenv').config();

const SECRET = process.env.JWT_SECRET;

function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    let token = (authHeader && authHeader.startsWith('Bearer ')) ? authHeader.slice(7) : null;
    if (!token && req.cookies && req.cookies.token) token = req.cookies.token;
    if (!token) return res.status(401).json({ error: 'No token provided' });

    jwt.verify(token, SECRET, (err, user) => {
        if (err) return res.status(403).json({ error: 'Invalid token' });
        req.user = user;
        next();
    });
}

module.exports = { authenticateToken };