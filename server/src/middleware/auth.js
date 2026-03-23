const jwt = require('jsonwebtoken')

function auth(required = true) {
  return (req, res, next) => {
    const header = req.headers.authorization || ''
    const token = header.startsWith('Bearer ') ? header.slice(7) : null
    if (!token) {
      if (required) return res.status(401).json({ error: 'Unauthorized' })
      req.user = null; return next()
    }
    try {
      const payload = jwt.verify(token, process.env.JWT_SECRET || 'smartbank_secret_key')
      req.user = payload
      next()
    } catch {
      return res.status(401).json({ error: 'Invalid token' })
    }
  }
}

function requireRoles(roles) {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) return res.status(403).json({ error: 'Forbidden' })
    next()
  }
}

module.exports = { auth, requireRoles }

