const jwt = require('jsonwebtoken');
const env = require('../config/env');
const { query } = require('../config/db');
const ApiError = require('../utils/apiError');
const { getBearerToken, hashToken } = require('../utils/security');

async function requireAdmin(req, _res, next) {
  try {
    const token = getBearerToken(req);
    if (!token) throw new ApiError(401, 'Missing bearer token');

    const tokenHash = hashToken(token);
    const blacklisted = await query('SELECT id FROM token_blacklist WHERE token_hash = $1 AND expires_at > NOW()', [tokenHash]);
    if (blacklisted.rowCount) throw new ApiError(401, 'Token has been logged out');

    const payload = jwt.verify(token, env.jwtSecret);
    const admin = await query('SELECT id, email, full_name, active FROM admin_users WHERE id = $1', [payload.sub]);
    if (!admin.rowCount || !admin.rows[0].active) throw new ApiError(401, 'Admin account not found or inactive');

    req.admin = admin.rows[0];
    req.token = token;
    req.tokenPayload = payload;
    next();
  } catch (error) {
    next(error.name === 'JsonWebTokenError' ? new ApiError(401, 'Invalid token') : error);
  }
}

module.exports = { requireAdmin };
