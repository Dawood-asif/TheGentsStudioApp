const crypto = require('crypto');
const env = require('../config/env');
const { query } = require('../config/db');
const ApiError = require('../utils/apiError');
const { normalizePakistaniPhone } = require('../utils/phone');

function generateOtp() {
  return String(Math.floor(100000 + Math.random() * 900000));
}

function hashOtp(phone, otp, purpose) {
  return crypto.createHash('sha256').update(`${normalizePakistaniPhone(phone)}:${otp}:${purpose}:${env.jwtSecret}`).digest('hex');
}

async function sendViaTwilio(phone, message) {
  if (!env.twilioAccountSid || !env.twilioAuthToken || (!env.twilioFromNumber && !env.twilioMessagingServiceSid)) {
    throw new ApiError(500, 'Twilio OTP credentials are not configured');
  }

  const body = new URLSearchParams({ To: normalizePakistaniPhone(phone), Body: message });
  if (env.twilioMessagingServiceSid) body.set('MessagingServiceSid', env.twilioMessagingServiceSid);
  else body.set('From', env.twilioFromNumber);

  const response = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${env.twilioAccountSid}/Messages.json`, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${Buffer.from(`${env.twilioAccountSid}:${env.twilioAuthToken}`).toString('base64')}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body,
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new ApiError(502, 'Twilio OTP send failed', data);
  return data;
}

async function sendViaWhatsAppCloud(phone, message) {
  if (!env.whatsappCloudToken || !env.whatsappPhoneNumberId) {
    throw new ApiError(500, 'WhatsApp Cloud OTP credentials are not configured');
  }

  const response = await fetch(`https://graph.facebook.com/v19.0/${env.whatsappPhoneNumberId}/messages`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${env.whatsappCloudToken}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      messaging_product: 'whatsapp',
      to: normalizePakistaniPhone(phone).replace('+', ''),
      type: 'text',
      text: { preview_url: false, body: message },
    }),
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new ApiError(502, 'WhatsApp OTP send failed', data);
  return data;
}

async function createAndSendOtp({ phone, purpose = 'signup' }) {
  const normalizedPhone = normalizePakistaniPhone(phone);
  const otp = env.otpProvider === 'demo' ? '123456' : generateOtp();
  const expiresAt = new Date(Date.now() + env.otpExpiryMinutes * 60 * 1000);
  const message = `The Gents Studio & Spa verification code is ${otp}. It expires in ${env.otpExpiryMinutes} minutes.`;

  await query(
    'INSERT INTO otp_codes (phone, purpose, otp_hash, expires_at, provider) VALUES ($1,$2,$3,$4,$5)',
    [normalizedPhone, purpose, hashOtp(normalizedPhone, otp, purpose), expiresAt, env.otpProvider],
  );

  let providerResponse = { provider: env.otpProvider, sent: false };
  if (env.otpProvider === 'twilio') providerResponse = await sendViaTwilio(normalizedPhone, message);
  else if (env.otpProvider === 'whatsapp') providerResponse = await sendViaWhatsAppCloud(normalizedPhone, message);
  else {
    providerResponse = { provider: 'demo', sent: true, demoCode: otp };
    console.log(`[DEMO OTP] ${normalizedPhone} / ${purpose}: ${otp}`);
  }

  return {
    phone: normalizedPhone,
    expiresAt,
    provider: env.otpProvider,
    demoCode: env.otpProvider === 'demo' ? otp : undefined,
    providerResponse,
  };
}

async function verifyOtp({ phone, code, purpose = 'signup' }) {
  const normalizedPhone = normalizePakistaniPhone(phone);
  const result = await query(
    `SELECT * FROM otp_codes
     WHERE phone = $1 AND purpose = $2 AND verified_at IS NULL
     ORDER BY created_at DESC
     LIMIT 1`,
    [normalizedPhone, purpose],
  );

  const record = result.rows[0];
  if (!record) throw new ApiError(404, 'No OTP request found');
  if (new Date(record.expires_at) < new Date()) throw new ApiError(410, 'OTP expired');
  if (record.attempts >= 5) throw new ApiError(429, 'Too many OTP attempts');

  const expectedHash = hashOtp(normalizedPhone, code, purpose);
  if (expectedHash !== record.otp_hash) {
    await query('UPDATE otp_codes SET attempts = attempts + 1 WHERE id = $1', [record.id]);
    throw new ApiError(401, 'Invalid OTP code');
  }

  await query('UPDATE otp_codes SET verified_at = NOW() WHERE id = $1', [record.id]);
  await query('UPDATE customers SET otp_verified = TRUE WHERE phone IN ($1, $2)', [normalizedPhone, phone]);

  return { phone: normalizedPhone, verified: true, purpose };
}

module.exports = { createAndSendOtp, verifyOtp, normalizePakistaniPhone };
