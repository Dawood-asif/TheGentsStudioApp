const express = require('express');
const { z } = require('zod');
const { query } = require('../config/db');
const validate = require('../middleware/validate');
const { requireStaffDevice } = require('../middleware/staffDeviceAuth');
const asyncHandler = require('../utils/asyncHandler');
const { addVisitStamp } = require('../services/stampService');

const router = express.Router();

router.use(requireStaffDevice);

router.post('/stamps/add', validate(z.object({
  body: z.object({
    customerId: z.string().uuid().optional(),
    customerCode: z.string().optional(),
    phone: z.string().optional(),
    serviceId: z.string().uuid().optional(),
    appointmentId: z.string().uuid().optional(),
    note: z.string().optional(),
  }).refine(data => data.customerId || data.customerCode || data.phone, 'customerId, customerCode, or phone is required'),
})), asyncHandler(async (req, res) => {
  const result = await addVisitStamp({ ...req.body, note: req.body.note || 'QR scanner stamp' });
  res.status(201).json({ success: true, data: result });
}));

router.post('/offline-sync', validate(z.object({
  body: z.object({
    deviceId: z.string().min(1),
    actions: z.array(z.object({
      localId: z.string().optional(),
      type: z.enum(['ADD_STAMP', 'CREATE_APPOINTMENT']),
      payload: z.record(z.any()),
      createdAt: z.string().optional(),
    })).max(100),
  }),
})), asyncHandler(async (req, res) => {
  const results = [];

  for (const action of req.body.actions) {
    try {
      let result;
      if (action.type === 'ADD_STAMP') {
        result = await addVisitStamp({ ...action.payload, note: action.payload.note || `Offline QR sync from ${req.body.deviceId}` });
      } else {
        const body = action.payload;
        const appointment = await query(
          `INSERT INTO appointments (customer_id, customer_name, phone, appointment_at, service_ids, package_subtotal, package_discount, package_total, notes, created_offline, sync_status)
           VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,TRUE,'synced') RETURNING *`,
          [body.customerId || null, body.customerName || null, body.phone || null, body.appointmentAt || null, body.serviceIds || [], body.packageSubtotal || 0, body.packageDiscount || 0, body.packageTotal || 0, body.notes || null],
        );
        result = appointment.rows[0];
      }

      await query(
        'INSERT INTO offline_sync_queue (device_id, action_type, payload, status, synced_at) VALUES ($1,$2,$3,$4,NOW())',
        [req.body.deviceId, action.type, action.payload, 'synced'],
      );
      results.push({ localId: action.localId, ok: true, result });
    } catch (error) {
      await query(
        'INSERT INTO offline_sync_queue (device_id, action_type, payload, status, error_message) VALUES ($1,$2,$3,$4,$5)',
        [req.body.deviceId, action.type, action.payload, 'failed', error.message],
      );
      results.push({ localId: action.localId, ok: false, error: error.message });
    }
  }

  res.json({ success: true, data: results });
}));

module.exports = router;
