const express = require('express');
const { z } = require('zod');
const { query } = require('../config/db');
const { requireAdmin } = require('../middleware/auth');
const validate = require('../middleware/validate');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/apiError');

const router = express.Router();

router.get('/', asyncHandler(async (req, res) => {
  const category = req.query.category ? String(req.query.category) : null;
  const result = category
    ? await query('SELECT * FROM services WHERE active = TRUE AND category = $1 ORDER BY category, price_pkr, name', [category])
    : await query('SELECT * FROM services WHERE active = TRUE ORDER BY category, price_pkr, name');
  res.json({ success: true, data: result.rows });
}));

router.post('/', requireAdmin, validate(z.object({
  body: z.object({ category: z.string().min(2), name: z.string().min(2), pricePkr: z.number().int().nonnegative(), active: z.boolean().optional() }),
})), asyncHandler(async (req, res) => {
  const { category, name, pricePkr, active = true } = req.body;
  const result = await query('INSERT INTO services (category, name, price_pkr, active) VALUES ($1,$2,$3,$4) RETURNING *', [category, name, pricePkr, active]);
  res.status(201).json({ success: true, data: result.rows[0] });
}));

router.put('/:id', requireAdmin, asyncHandler(async (req, res) => {
  const map = { category: 'category', name: 'name', pricePkr: 'price_pkr', active: 'active' };
  const entries = Object.entries(req.body).filter(([key]) => map[key]);
  if (!entries.length) throw new ApiError(400, 'No allowed fields provided');

  const sets = entries.map(([key], index) => `${map[key]} = $${index + 1}`).join(', ');
  const values = entries.map(([, value]) => value);
  values.push(req.params.id);

  const result = await query(`UPDATE services SET ${sets} WHERE id = $${values.length} RETURNING *`, values);
  if (!result.rowCount) throw new ApiError(404, 'Service not found');
  res.json({ success: true, data: result.rows[0] });
}));

router.delete('/:id', requireAdmin, asyncHandler(async (req, res) => {
  const result = await query('UPDATE services SET active = FALSE WHERE id = $1 RETURNING *', [req.params.id]);
  if (!result.rowCount) throw new ApiError(404, 'Service not found');
  res.json({ success: true, message: 'Service deactivated', data: result.rows[0] });
}));

module.exports = router;
