const express = require('express');
const { z } = require('zod');
const validate = require('../middleware/validate');
const asyncHandler = require('../utils/asyncHandler');
const { createAndSendOtp, verifyOtp } = require('../services/otpService');

const router = express.Router();

router.post('/send', validate(z.object({
  body: z.object({
    phone: z.string().min(8),
    purpose: z.enum(['signup', 'login', 'phone_update']).optional(),
  }),
})), asyncHandler(async (req, res) => {
  const result = await createAndSendOtp({ phone: req.body.phone, purpose: req.body.purpose || 'signup' });
  res.status(201).json({
    success: true,
    message: 'OTP sent',
    data: {
      phone: result.phone,
      expiresAt: result.expiresAt,
      provider: result.provider,
      ...(result.demoCode ? { demoCode: result.demoCode } : {}),
    },
  });
}));

router.post('/verify', validate(z.object({
  body: z.object({
    phone: z.string().min(8),
    code: z.string().length(6),
    purpose: z.enum(['signup', 'login', 'phone_update']).optional(),
  }),
})), asyncHandler(async (req, res) => {
  const result = await verifyOtp({ phone: req.body.phone, code: req.body.code, purpose: req.body.purpose || 'signup' });
  res.json({ success: true, message: 'OTP verified', data: result });
}));

module.exports = router;
