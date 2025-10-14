// Placeholder auth middleware: Expects 'Authorization: Bearer dummy_token'
const jwt = require('jsonwebtoken');

const auth = (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  if (!token || token !== 'dummy_token') {
    return res.status(401).json({ error: 'Access denied. No valid token.' });
  }
  try {
    // Dummy verification
    jwt.verify(token, 'secret_key');  // In real app, use proper secret
    next();
  } catch (err) {
    res.status(400).json({ error: 'Invalid token.' });
  }
};

module.exports = auth;
