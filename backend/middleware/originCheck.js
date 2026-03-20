require('dotenv').config();

module.exports = function originCheck(req, res, next) {
  if (process.env.IGNORE_FRONTEND_CHECK === 'true') {
    return next();
  }

  const allowedOrigins = process.env.FRONTEND_ADDRESSES.split(',').map(origin => origin.trim());
  const origin = req.headers.origin;

  console.log('Origin Check:', {
    allowedOrigins,
    requestOrigin: origin,
  });

  // Only allow requests from the frontend address
  if (origin && !allowedOrigins.includes(origin)) {
    return res.status(403).json({ error: 'Forbidden: invalid origin' });
  }

  next();
};
