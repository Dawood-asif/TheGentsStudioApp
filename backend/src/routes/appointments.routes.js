const express = require('express');
const { z } = require('zod');
const { query } = require('../config/db');
const { requireAdmin } = require('../middleware/auth');
const validate = require('../middleware/validate');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/apiError');

const router = express.Router();

router.get('/', requireAdmin, asyncHandler(async (req, res) => {
  const params = [];
  const where = [];
  if (req.query.status) { params.push(String(req.query.status)); where.push(`a.status = $${params.length}`); }
  if (req.query.phone) { params.push(`%${req.query.phone}%`); where.push(`a.phone ILIKE $${params.length}`); }

  const result = await query(
    `SELECT a.*, c.full_name AS customer_full_name, c.customer_code
     FROM appointments a
     LEFT JOIN customers c ON c.id = a.customer_id
     ${where.length ? `WHERE ${where.join(' AND ')}` : ''}
     ORDER BY COALESCE(a.appointment_at, a.created_at) DESC
     LIMIT 500`,
    params,
  );
  res.json({ success: true, data: result.rows });
}));

router.post('/', validate(z.object({
  body: z.object({
    customerId: z.string().uuid().optional().nullable(),
    customerName: z.string().optional().nullable(),
    phone: z.string().optional().nullable(),
    appointmentAt: z.string().optional().nullable(),
    serviceIds: z.array(z.string().uuid()).optional(),
    packageSubtotal: z.number().int().nonnegative().optional(),
    packageDiscount: z.number().int().nonnegative().optional(),
    packageTotal: z.number().int().nonnegative().optional(),
    notes: z.string().optional().nullable(),
    createdOffline: z.boolean().optional(),
  }),
})), asyncHandler(async (req, res) => {
  const body = req.body;
  const result = await query(
    `INSERT INTO appointments (customer_id, customer_name, phone, appointment_at, service_ids, package_subtotal, package_discount, package_total, notes, created_offline, sync_status)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)
     RETURNING *`,
    [
      body.customerId || null,
      body.customerName || null,
      body.phone || null,
      body.appointmentAt || null,
      body.serviceIds || [],
      body.packageSubtotal || 0,
      body.packageDiscount || 0,
      body.packageTotal || 0,
      body.notes || null,
      body.createdOffline || false,
      body.createdOffline ? 'pending' : 'synced',
    ],
  );
  res.status(201).json({ success: true, data: result.rows[0], message: 'Booking record created. Staff selection is by phone only.' });
}));

router.put('/:id/status', requireAdmin, validate(z.object({
  body: z.object({ status: z.enum(['pending','confirmed','completed','cancelled','no_show']) }),
})), asyncHandler(async (req, res) => {
  const result = await query('UPDATE appointments SET status = $1 WHERE id = $2 RETURNING *', [req.body.status, req.params.id]);
  if (!result.rowCount) throw new ApiError(404, 'Appointment not found');
  res.json({ success: true, data: result.rows[0] });
}));

module.exports = router;
