const express = require('express');
const { z } = require('zod');
const { query } = require('../config/db');
const { requireAdmin } = require('../middleware/auth');
const validate = require('../middleware/validate');
const asyncHandler = require('../utils/asyncHandler');
const { addVisitStamp } = require('../services/stampService');

const router = express.Router();

router.post('/add', requireAdmin, validate(z.object({
  body: z.object({
    customerId: z.string().uuid().optional(),
    customerCode: z.string().optional(),
    phone: z.string().optional(),
    serviceId: z.string().uuid().optional(),
    appointmentId: z.string().uuid().optional(),
    note: z.string().optional(),
  }).refine(data => data.customerId || data.customerCode || data.phone, 'customerId, customerCode, or phone is required'),
})), asyncHandler(async (req, res) => {
  const result = await addVisitStamp({ ...req.body, adminId: req.admin.id });
  res.status(201).json({ success: true, data: result });
}));

router.get('/history/:customerId', requireAdmin, asyncHandler(async (req, res) => {
  const result = await query('SELECT * FROM stamp_transactions WHERE customer_id = $1 ORDER BY created_at DESC LIMIT 100', [req.params.customerId]);
  res.json({ success: true, data: result.rows });
}));

module.exports = router;
