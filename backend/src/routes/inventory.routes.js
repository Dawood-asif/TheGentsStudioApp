const express = require('express');
const { z } = require('zod');
const { query } = require('../config/db');
const { requireAdmin } = require('../middleware/auth');
const validate = require('../middleware/validate');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/apiError');

const router = express.Router();

router.use(requireAdmin);

router.get('/', asyncHandler(async (_req, res) => {
  const result = await query('SELECT * FROM inventory WHERE active = TRUE ORDER BY item_name');
  res.json({ success: true, data: result.rows });
}));

router.post('/', validate(z.object({
  body: z.object({
    itemName: z.string().min(2),
    category: z.string().optional().nullable(),
    quantity: z.number().nonnegative().optional(),
    unit: z.string().optional(),
    reorderLevel: z.number().nonnegative().optional(),
    notes: z.string().optional().nullable(),
  }),
})), asyncHandler(async (req, res) => {
  const body = req.body;
  const result = await query(
    `INSERT INTO inventory (item_name, category, quantity, unit, reorder_level, notes)
     VALUES ($1,$2,$3,$4,$5,$6)
     RETURNING *`,
    [body.itemName, body.category || null, body.quantity || 0, body.unit || 'pcs', body.reorderLevel || 0, body.notes || null],
  );
  res.status(201).json({ success: true, data: result.rows[0] });
}));

router.put('/:id', asyncHandler(async (req, res) => {
  const map = { itemName: 'item_name', category: 'category', quantity: 'quantity', unit: 'unit', reorderLevel: 'reorder_level', notes: 'notes', active: 'active' };
  const entries = Object.entries(req.body).filter(([key]) => map[key]);
  if (!entries.length) throw new ApiError(400, 'No allowed fields provided');

  const sets = entries.map(([key], index) => `${map[key]} = $${index + 1}`).join(', ');
  const values = entries.map(([, value]) => value);
  values.push(req.params.id);

  const result = await query(`UPDATE inventory SET ${sets} WHERE id = $${values.length} RETURNING *`, values);
  if (!result.rowCount) throw new ApiError(404, 'Inventory item not found');
  res.json({ success: true, data: result.rows[0] });
}));

module.exports = router;
