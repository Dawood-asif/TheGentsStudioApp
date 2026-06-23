const express = require('express');
const { z } = require('zod');
const { query } = require('../config/db');
const validate = require('../middleware/validate');
const asyncHandler = require('../utils/asyncHandler');

const router = express.Router();

router.post('/queue', validate(z.object({
  body: z.object({
    deviceId: z.string().optional(),
    actionType: z.string().min(2),
    payload: z.record(z.any()),
  }),
})), asyncHandler(async (req, res) => {
  const result = await query(
    'INSERT INTO offline_sync_queue (device_id, action_type, payload, status) VALUES ($1,$2,$3,$4) RETURNING *',
    [req.body.deviceId || null, req.body.actionType, req.body.payload, 'pending'],
  );
  res.status(201).json({ success: true, data: result.rows[0] });
}));

router.get('/pending/:deviceId', asyncHandler(async (req, res) => {
  const result = await query(
    'SELECT * FROM offline_sync_queue WHERE device_id = $1 AND status = $2 ORDER BY created_at ASC',
    [req.params.deviceId, 'pending'],
  );
  res.json({ success: true, data: result.rows });
}));

module.exports = router;
