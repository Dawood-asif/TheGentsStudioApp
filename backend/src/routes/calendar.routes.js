const express = require('express');
const { query } = require('../config/db');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/apiError');

const router = express.Router();

function parseDate(value) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value || '')) throw new ApiError(400, 'date query must be YYYY-MM-DD');
  return value;
}

function makeSlots(date, startHour = 8, endHour = 21, stepMinutes = 30) {
  const slots = [];
  const start = new Date(`${date}T${String(startHour).padStart(2, '0')}:00:00+05:00`);
  const end = new Date(`${date}T${String(endHour).padStart(2, '0')}:00:00+05:00`);
  for (let cursor = new Date(start); cursor < end; cursor = new Date(cursor.getTime() + stepMinutes * 60000)) {
    slots.push(cursor.toISOString());
  }
  return slots;
}

router.get('/slots', asyncHandler(async (req, res) => {
  const date = parseDate(req.query.date);
  const stepMinutes = Number(req.query.stepMinutes || 30);
  const slots = makeSlots(date, 8, 21, stepMinutes);

  const booked = await query(
    `SELECT appointment_at
     FROM appointments
     WHERE appointment_at::date = $1::date AND status IN ('pending','confirmed')`,
    [date],
  );
  const bookedSet = new Set(booked.rows.map(row => new Date(row.appointment_at).toISOString()));

  res.json({
    success: true,
    date,
    note: 'Slots are request slots only. Final confirmation is by phone.',
    data: slots.map(slot => ({ slot, available: !bookedSet.has(slot) })),
  });
}));

module.exports = router;
