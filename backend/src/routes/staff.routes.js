const express = require('express');
const { z } = require('zod');
const { query } = require('../config/db');
const { requireAdmin } = require('../middleware/auth');
const validate = require('../middleware/validate');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/apiError');
const { uploadDataImage } = require('../services/storageService');

const router = express.Router();

router.get('/', asyncHandler(async (_req, res) => {
  const result = await query('SELECT * FROM staff WHERE active = TRUE ORDER BY name');
  res.json({ success: true, data: result.rows });
}));

router.post('/', requireAdmin, validate(z.object({
  body: z.object({
    name: z.string().min(2),
    specialty: z.string().min(3),
    rating: z.number().min(1).max(5).optional(),
    phone: z.string().optional().nullable(),
    commissionPercentage: z.number().min(0).max(100).optional(),
    photoUrl: z.string().optional().nullable(),
    active: z.boolean().optional(),
  }),
})), asyncHandler(async (req, res) => {
  const {
    name,
    specialty,
    rating = 5,
    phone = null,
    commissionPercentage = 0,
    photoUrl = null,
    active = true,
  } = req.body;

  const result = await query(
    `INSERT INTO staff (name, specialty, rating, phone, commission_percentage, active, photo_url)
     VALUES ($1,$2,$3,$4,$5,$6,$7)
     RETURNING *`,
    [name, specialty, rating, phone, commissionPercentage, active, photoUrl],
  );

  res.status(201).json({ success: true, data: result.rows[0] });
}));

router.put('/:id', requireAdmin, asyncHandler(async (req, res) => {
  const map = {
    name: 'name',
    specialty: 'specialty',
    rating: 'rating',
    phone: 'phone',
    commissionPercentage: 'commission_percentage',
    photoUrl: 'photo_url',
    active: 'active',
  };

  const entries = Object.entries(req.body).filter(([key]) => map[key]);
  if (!entries.length) throw new ApiError(400, 'No allowed fields provided');

  const sets = entries.map(([key], index) => `${map[key]} = $${index + 1}`).join(', ');
  const values = entries.map(([, value]) => value);
  values.push(req.params.id);

  if (req.body.photoUrl && String(req.body.photoUrl).startsWith('data:image/')) {
    req.body.photoUrl = await uploadDataImage({
      imageData: req.body.photoUrl,
      folder: 'staff',
      filePrefix: 'staff-' + req.params.id,
    });
  }

  const result = await query(`UPDATE staff SET ${sets} WHERE id = ${values.length} RETURNING *`, values);

  if (!result.rowCount) throw new ApiError(404, 'Staff member not found');

  res.json({ success: true, data: result.rows[0] });
}));

module.exports = router;
