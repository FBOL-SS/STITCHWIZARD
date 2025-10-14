// Dummy auth middleware to show structure for future enhancements.
// Expects an Authorization header with value `Bearer demo-token`.
module.exports = function authMiddleware(req, res, next) {
  const header = req.headers['authorization'] || '';
  const token = header.replace('Bearer ', '');
  if (!token) {
    return res.status(401).json({ message: 'Missing token' });
  }

  if (token !== 'demo-token') {
    return res.status(403).json({ message: 'Invalid token' });
  }

  // Attach mock user context to request to illustrate structure.
  req.user = {
    id: 1,
    name: 'Demo User',
    roles: ['admin']
  };

  return next();
};
