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
const { verifyOtp } = require('../services/otpService');
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
router.post('/login', validate(z.object({
  body: z.object({
    phone: z.string().min(8),
    code: z.string().length(6),
  }),
})), asyncHandler(async (req, res) => {
  const { phone, code } = req.body;
  const normalizedPhone = normalizePakistaniPhone(phone);

  await verifyOtp({ phone: normalizedPhone, code, purpose: 'login' });

  const result = await query(
    'UPDATE customers SET last_login = NOW(), otp_verified = TRUE WHERE phone = $1 RETURNING *',
    [normalizedPhone],
  );

  if (!result.rowCount) throw new ApiError(404, 'Account not found. Please signup first.');

  res.json({ success: true, data: result.rows[0], message: 'Customer logged in successfully.' });
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

  const normalizedPhone = normalizePakistaniPhone(phone);
  const normalizedEmail = email.toLowerCase();

  const verifiedOtp = await query(
    `SELECT id FROM otp_codes
     WHERE phone = $1 AND purpose = 'signup' AND verified_at IS NOT NULL
     ORDER BY verified_at DESC LIMIT 1`,
    [normalizedPhone],
  );
  if (!verifiedOtp.rowCount) throw new ApiError(401, 'Please verify OTP before creating account');

  // If the same verified phone already exists, treat signup like login and return the existing customer.
  // This prevents "internal server error" when a customer retries after a previous successful signup.
  const existingByPhone = await query('SELECT * FROM customers WHERE phone = $1', [normalizedPhone]);
  if (existingByPhone.rowCount) {
    const updated = await query(
      `UPDATE customers
       SET full_name = COALESCE(NULLIF($1, ''), full_name),
           email = CASE WHEN email = $2 OR NOT EXISTS (SELECT 1 FROM customers WHERE email = $2 AND phone <> $3) THEN $2 ELSE email END,
           birthday = COALESCE($4, birthday),
           terms_accepted = TRUE,
           otp_verified = TRUE,
           last_login = NOW()
       WHERE phone = $3
       RETURNING *`,
      [fullName, normalizedEmail, normalizedPhone, birthday],
    );
    return res.json({ success: true, data: updated.rows[0], message: 'Existing verified account loaded.' });
  }

  const existingByEmail = await query('SELECT id FROM customers WHERE email = $1', [normalizedEmail]);
  if (existingByEmail.rowCount) {
    throw new ApiError(409, 'Email already exists. Use a different email or ask admin to update your profile.');
  }

  const customerCode = generateCustomerCode();
  const referralCode = generateReferralCode();

  const result = await query(
    `INSERT INTO customers (customer_code, full_name, phone, email, birthday, terms_accepted, otp_verified, referral_code, referred_by_code, last_login)
     VALUES ($1,$2,$3,$4,$5,$6,TRUE,$7,$8,NOW())
     RETURNING *`,
    [customerCode, fullName, normalizedPhone, normalizedEmail, birthday, termsAccepted, referralCode, referredByCode || null],
  );

  res.status(201).json({ success: true, data: result.rows[0], message: 'Customer created successfully.' });
}));

router.post('/:id/profile-image', validate(z.object({
  body: z.object({
    imageData: z.string().min(40).max(2_500_000),
  }),
})), asyncHandler(async (req, res) => {
  const { imageData } = req.body;
  if (!imageData.startsWith('data:image/')) {
    throw new ApiError(400, 'profile image must be a data:image URI');
  }

  const result = await query(
    'UPDATE customers SET profile_image_url = $1 WHERE id = $2 RETURNING id, customer_code, full_name, phone, email, profile_image_url',
    [imageData, req.params.id],
  );
  if (!result.rowCount) throw new ApiError(404, 'Customer not found');

  res.json({ success: true, data: result.rows[0], message: 'Profile photo updated' });
}));

router.put('/:id', requireAdmin, asyncHandler(async (req, res) => {
  const allowed = ['full_name','phone','email','birthday','stamps','points','visits','current_streak','longest_streak','vip','otp_verified','profile_image_url','customer_notes','preferences'];
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
