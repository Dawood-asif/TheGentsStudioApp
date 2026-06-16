const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const speakeasy = require('speakeasy');
const { z } = require('zod');
const { randomUUID } = require('crypto');
const env = require('../config/env');
const { query } = require('../config/db');
const validate = require('../middleware/validate');
const { requireAdmin } = require('../middleware/auth');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/apiError');
const { hashToken } = require('../utils/security');

const router = express.Router();

function signAccessToken(admin) {
  return jwt.sign(
    { sub: admin.id, email: admin.email, role: 'admin', jti: randomUUID() },
    env.jwtSecret,
    { expiresIn: env.jwtExpiresIn },
  );
}

function signRefreshToken(admin) {
  return jwt.sign(
    { sub: admin.id, email: admin.email, type: 'refresh', jti: randomUUID() },
    env.refreshTokenSecret,
    { expiresIn: `${env.refreshTokenExpiresDays}d` },
  );
}

router.post('/login', validate(z.object({
  body: z.object({
    email: z.string().email(),
    password: z.string().min(6),
    twoFactorCode: z.string().optional(),
  }),
})), asyncHandler(async (req, res) => {
  const { email, password, twoFactorCode } = req.body;
  const result = await query('SELECT * FROM admin_users WHERE email = $1', [email.toLowerCase()]);
  const admin = result.rows[0];

  if (!admin || !admin.active) throw new ApiError(401, 'Invalid credentials');
  if (admin.locked_until && new Date(admin.locked_until) > new Date()) throw new ApiError(423, 'Account temporarily locked');

  const ok = await bcrypt.compare(password, admin.password_hash);
  if (!ok) {
    await query('UPDATE admin_users SET failed_login_count = failed_login_count + 1, locked_until = CASE WHEN failed_login_count >= 4 THEN NOW() + INTERVAL \'15 minutes\' ELSE locked_until END WHERE id = $1', [admin.id]);
    await query('INSERT INTO security_logs (admin_user_id, action, ip_address, user_agent, metadata) VALUES ($1,$2,$3,$4,$5)', [admin.id, 'admin_login_failed', req.ip, req.headers['user-agent'], { email }]);
    throw new ApiError(401, 'Invalid credentials');
  }

  if (admin.two_factor_enabled) {
    if (!twoFactorCode) throw new ApiError(401, 'Two-factor code required');
    const verified = speakeasy.totp.verify({ secret: admin.two_factor_secret, encoding: 'base32', token: twoFactorCode, window: 1 });
    if (!verified) throw new ApiError(401, 'Invalid two-factor code');
  }

  const accessToken = signAccessToken(admin);
  const refreshToken = signRefreshToken(admin);
  const expiresAt = new Date(Date.now() + env.refreshTokenExpiresDays * 24 * 60 * 60 * 1000);

  await query('INSERT INTO refresh_tokens (admin_user_id, token_hash, expires_at) VALUES ($1,$2,$3)', [admin.id, hashToken(refreshToken), expiresAt]);
  await query('UPDATE admin_users SET failed_login_count = 0, locked_until = NULL, last_login = NOW() WHERE id = $1', [admin.id]);
  await query('INSERT INTO security_logs (admin_user_id, action, ip_address, user_agent) VALUES ($1,$2,$3,$4)', [admin.id, 'admin_login_success', req.ip, req.headers['user-agent']]);

  res.json({
    success: true,
    accessToken,
    refreshToken,
    admin: { id: admin.id, email: admin.email, fullName: admin.full_name, twoFactorEnabled: admin.two_factor_enabled },
  });
}));

router.post('/logout', requireAdmin, asyncHandler(async (req, res) => {
  const tokenHash = hashToken(req.token);
  const expiresAt = new Date((req.tokenPayload.exp || Math.floor(Date.now() / 1000) + 86400) * 1000);
  await query('INSERT INTO token_blacklist (token_hash, expires_at) VALUES ($1,$2) ON CONFLICT (token_hash) DO NOTHING', [tokenHash, expiresAt]);

  if (req.body.refreshToken) {
    await query('UPDATE refresh_tokens SET revoked_at = NOW() WHERE token_hash = $1', [hashToken(req.body.refreshToken)]);
  }

  await query('INSERT INTO security_logs (admin_user_id, action, ip_address, user_agent) VALUES ($1,$2,$3,$4)', [req.admin.id, 'admin_logout', req.ip, req.headers['user-agent']]);
  res.json({ success: true, message: 'Logged out' });
}));

module.exports = router;
