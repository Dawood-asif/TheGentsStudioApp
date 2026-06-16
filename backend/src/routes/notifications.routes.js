const express = require('express');
const { z } = require('zod');
const validate = require('../middleware/validate');
const { requireAdmin } = require('../middleware/auth');
const asyncHandler = require('../utils/asyncHandler');
const { registerDeviceToken, sendToCustomer, broadcast } = require('../services/notificationService');

const router = express.Router();

router.post('/register-token', validate(z.object({
  body: z.object({
    customerId: z.string().uuid().optional().nullable(),
    token: z.string().min(20),
    platform: z.enum(['android', 'ios', 'web']).optional(),
    deviceId: z.string().optional().nullable(),
  }),
})), asyncHandler(async (req, res) => {
  const token = await registerDeviceToken(req.body);
  res.status(201).json({ success: true, data: token });
}));

router.post('/send-test', requireAdmin, validate(z.object({
  body: z.object({
    customerId: z.string().uuid(),
    title: z.string().min(1),
    body: z.string().min(1),
    data: z.record(z.any()).optional(),
  }),
})), asyncHandler(async (req, res) => {
  const result = await sendToCustomer(req.body);
  res.json({ success: true, data: result });
}));

router.post('/broadcast', requireAdmin, validate(z.object({
  body: z.object({
    title: z.string().min(1),
    body: z.string().min(1),
    data: z.record(z.any()).optional(),
  }),
})), asyncHandler(async (req, res) => {
  const result = await broadcast(req.body);
  res.json({ success: true, data: result });
}));

module.exports = router;
