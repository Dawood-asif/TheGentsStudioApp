const express = require('express');
const { z } = require('zod');
const QRCode = require('qrcode');
const { query } = require('../config/db');
const { requireAdmin } = require('../middleware/auth');
const validate = require('../middleware/validate');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/apiError');
const { generateCustomerCode, generateReferralCode } = require('../utils/customerIds');
const { normalizePakistaniPhone } = require('../utils/phone');

const router = express.Router();

const signupSchema = z.object({
  body: z.object({
    fullName: z.string().min(2),
    phone: z.string().min(8),
    email: z.string().email(),
    birthday: z.string().min(8),
    termsAccepted: z.boolean(),
    referredByCode: z.string().optional().nullable(),
  }),
});

router.get('/', requireAdmin, asyncHandler(async (req, res) => {
  const search = String(req.query.search || '').trim();
  const params = [];
  let where = '';

  if (search) {
    params.push(`%${search}%`);
    where = 'WHERE full_name ILIKE $1 OR phone ILIKE $1 OR email ILIKE $1 OR customer_code ILIKE $1';
  }

  const result = await query(
    `SELECT * FROM customers ${where} ORDER BY join_date DESC LIMIT 500`,
    params,
  );
  res.json({ success: true, data: result.rows });
}));

router.get('/:id', requireAdmin, asyncHandler(async (req, res) => {
  const customer = await query('SELECT * FROM customers WHERE id = $1', [req.params.id]);
  if (!customer.rowCount) throw new ApiError(404, 'Customer not found');

  const history = await query(
    'SELECT * FROM stamp_transactions WHERE customer_id = $1 ORDER BY created_at DESC LIMIT 50',
    [req.params.id],
  );

  res.json({ success: true, data: { ...customer.rows[0], stampHistory: history.rows } });
}));

router.get('/:id/qrcode', requireAdmin, asyncHandler(async (req, res) => {
  const customer = await query('SELECT id, customer_code, full_name FROM customers WHERE id = $1', [req.params.id]);
  if (!customer.rowCount) throw new ApiError(404, 'Customer not found');

  const qrPayload = JSON.stringify({ type: 'GENTS_CUSTOMER', customerId: customer.rows[0].id, customerCode: customer.rows[0].customer_code });
  const dataUrl = await QRCode.toDataURL(qrPayload, { margin: 1, width: 320, color: { dark: '#0A0A0A', light: '#FFFFFF' } });
  res.json({ success: true, data: { qrPayload, dataUrl, customer: customer.rows[0] } });
}));

router.post('/', validate(signupSchema), asyncHandler(async (req, res) => {
  const { fullName, phone, email, birthday, termsAccepted, referredByCode } = req.body;
  if (!termsAccepted) throw new ApiError(400, 'Terms and Privacy Policy agreement is required');

  const customerCode = generateCustomerCode();
  const referralCode = generateReferralCode();
  const normalizedPhone = normalizePakistaniPhone(phone);
  const verifiedOtp = await query(
    `SELECT id FROM otp_codes
     WHERE phone = $1 AND purpose = 'signup' AND verified_at IS NOT NULL
     ORDER BY verified_at DESC LIMIT 1`,
    [normalizedPhone],
  );

  const result = await query(
    `INSERT INTO customers (customer_code, full_name, phone, email, birthday, terms_accepted, otp_verified, referral_code, referred_by_code)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
     RETURNING *`,
    [customerCode, fullName, normalizedPhone, email.toLowerCase(), birthday, termsAccepted, verifiedOtp.rowCount > 0, referralCode, referredByCode || null],
  );

  res.status(201).json({ success: true, data: result.rows[0], message: 'Customer created. OTP provider can now send verification code.' });
}));

router.put('/:id', requireAdmin, asyncHandler(async (req, res) => {
  const allowed = ['full_name','phone','email','birthday','stamps','points','visits','current_streak','longest_streak','vip','otp_verified'];
  const entries = Object.entries(req.body).filter(([key]) => allowed.includes(key));
  if (!entries.length) throw new ApiError(400, 'No allowed fields provided');

  const sets = entries.map(([key], index) => `${key} = $${index + 1}`).join(', ');
  const values = entries.map(([, value]) => value);
  values.push(req.params.id);

  const result = await query(`UPDATE customers SET ${sets} WHERE id = $${values.length} RETURNING *`, values);
  if (!result.rowCount) throw new ApiError(404, 'Customer not found');

  await query('INSERT INTO security_logs (admin_user_id, action, ip_address, user_agent, metadata) VALUES ($1,$2,$3,$4,$5)', [req.admin.id, 'customer_updated', req.ip, req.headers['user-agent'], { customerId: req.params.id, fields: entries.map(([key]) => key) }]);
  res.json({ success: true, data: result.rows[0] });
}));

router.delete('/:id', requireAdmin, asyncHandler(async (req, res) => {
  const result = await query('DELETE FROM customers WHERE id = $1 RETURNING id', [req.params.id]);
  if (!result.rowCount) throw new ApiError(404, 'Customer not found');
  await query('INSERT INTO security_logs (admin_user_id, action, ip_address, user_agent, metadata) VALUES ($1,$2,$3,$4,$5)', [req.admin.id, 'customer_deleted', req.ip, req.headers['user-agent'], { customerId: req.params.id }]);
  res.json({ success: true, message: 'Customer deleted' });
}));

module.exports = router;
