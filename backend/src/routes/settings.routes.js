const express = require('express');
const { query } = require('../config/db');
const { requireAdmin } = require('../middleware/auth');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/apiError');

const router = express.Router();

router.get('/', asyncHandler(async (_req, res) => {
  const result = await query('SELECT key, value, updated_at FROM settings ORDER BY key');
  res.json({ success: true, data: result.rows });
}));

router.put('/:key', requireAdmin, asyncHandler(async (req, res) => {
  if (typeof req.body.value === 'undefined') throw new ApiError(400, 'value is required');
  const result = await query(
    `INSERT INTO settings (key, value, updated_at) VALUES ($1,$2,NOW())
     ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = NOW()
     RETURNING *`,
    [req.params.key, req.body.value],
  );
  res.json({ success: true, data: result.rows[0] });
}));

module.exports = router;
