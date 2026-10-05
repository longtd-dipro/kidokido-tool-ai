const jwt = require('jsonwebtoken');
function requireAuth(req, res, next) {
  const h = req.headers.authorization || '';
  try { req.user = jwt.verify(h.replace('Bearer ', ''), process.env.JWT_SECRET); next(); }
  catch (e) { res.status(401).end(); }
}
function requireRole(role) { return (req, res, next) => (req.user.role === role ? next() : res.status(403).end()); }
module.exports = { requireAuth, requireRole };
