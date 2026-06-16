const fs = require('fs');
const crypto = require('crypto');
const env = require('../config/env');
const { query } = require('../config/db');

let cachedAccessToken = null;
let cachedAccessTokenExpiry = 0;
let cachedServiceAccount = null;

function base64Url(input) {
  return Buffer.from(input).toString('base64').replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
}

function getServiceAccount() {
  if (cachedServiceAccount) return cachedServiceAccount;

  if (env.firebaseServiceAccountJson) {
    cachedServiceAccount = JSON.parse(env.firebaseServiceAccountJson);
    return cachedServiceAccount;
  }

  if (env.firebaseServiceAccountPath) {
    cachedServiceAccount = JSON.parse(fs.readFileSync(env.firebaseServiceAccountPath, 'utf8'));
    return cachedServiceAccount;
  }

  return null;
}

function makeJwtAssertion(serviceAccount) {
  const now = Math.floor(Date.now() / 1000);
  const header = { alg: 'RS256', typ: 'JWT' };
  const payload = {
    iss: serviceAccount.client_email,
    scope: 'https://www.googleapis.com/auth/firebase.messaging',
    aud: 'https://oauth2.googleapis.com/token',
    iat: now,
    exp: now + 3600,
  };

  const unsigned = `${base64Url(JSON.stringify(header))}.${base64Url(JSON.stringify(payload))}`;
  const signer = crypto.createSign('RSA-SHA256');
  signer.update(unsigned);
  signer.end();
  const signature = signer.sign(serviceAccount.private_key, 'base64').replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
  return `${unsigned}.${signature}`;
}

async function getFirebaseAccessToken() {
  if (cachedAccessToken && cachedAccessTokenExpiry > Date.now() + 60_000) return cachedAccessToken;

  const serviceAccount = getServiceAccount();
  if (!serviceAccount) return null;

  const assertion = makeJwtAssertion(serviceAccount);
  const body = new URLSearchParams({
    grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
    assertion,
  });

  const response = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body,
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(`Firebase OAuth token failed: ${JSON.stringify(data)}`);

  cachedAccessToken = data.access_token;
  cachedAccessTokenExpiry = Date.now() + Number(data.expires_in || 3600) * 1000;
  return cachedAccessToken;
}

async function registerDeviceToken({ customerId, token, platform = 'android', deviceId }) {
  const result = await query(
    `INSERT INTO device_tokens (customer_id, token, platform, device_id, enabled)
     VALUES ($1,$2,$3,$4,TRUE)
     ON CONFLICT (token) DO UPDATE SET customer_id = EXCLUDED.customer_id, platform = EXCLUDED.platform, device_id = EXCLUDED.device_id, enabled = TRUE, updated_at = NOW()
     RETURNING *`,
    [customerId || null, token, platform, deviceId || null],
  );
  return result.rows[0];
}

async function getTokensForCustomer(customerId) {
  const result = await query('SELECT token FROM device_tokens WHERE customer_id = $1 AND enabled = TRUE', [customerId]);
  return result.rows.map(row => row.token);
}

async function getAllEnabledTokens() {
  const result = await query('SELECT token, customer_id FROM device_tokens WHERE enabled = TRUE');
  return result.rows;
}

async function sendOneFcmMessage({ token, title, body, data = {} }) {
  const serviceAccount = getServiceAccount();
  const accessToken = await getFirebaseAccessToken();
  if (!serviceAccount || !accessToken) {
    return { skipped: true, reason: 'Firebase credentials not configured' };
  }

  const response = await fetch(`https://fcm.googleapis.com/v1/projects/${serviceAccount.project_id}/messages:send`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      message: {
        token,
        notification: { title, body },
        data: Object.fromEntries(Object.entries(data).map(([key, value]) => [key, String(value)])),
      },
    }),
  });

  const responseData = await response.json().catch(() => ({}));
  if (!response.ok) return { ok: false, error: responseData };
  return { ok: true, response: responseData };
}

async function sendPushToTokens({ tokens, title, body, data = {} }) {
  if (!tokens.length) return { successCount: 0, failureCount: 0, responses: [] };

  const responses = [];
  let successCount = 0;
  let failureCount = 0;

  for (const token of tokens) {
    const result = await sendOneFcmMessage({ token, title, body, data });
    responses.push(result);
    if (result.skipped) return { skipped: true, reason: result.reason, successCount: 0, failureCount: 0, responses };
    if (result.ok) successCount += 1;
    else failureCount += 1;
  }

  return { successCount, failureCount, responses };
}

async function sendToCustomer({ customerId, title, body, data = {} }) {
  const tokens = await getTokensForCustomer(customerId);
  const result = await sendPushToTokens({ tokens, title, body, data });
  await query(
    'INSERT INTO notification_logs (customer_id, title, body, data, status, provider_response) VALUES ($1,$2,$3,$4,$5,$6)',
    [customerId, title, body, data, result.skipped ? 'skipped' : 'sent', result],
  );
  return result;
}

async function broadcast({ title, body, data = {} }) {
  const tokenRows = await getAllEnabledTokens();
  const tokens = tokenRows.map(row => row.token);
  const result = await sendPushToTokens({ tokens, title, body, data });

  for (const row of tokenRows) {
    await query(
      'INSERT INTO notification_logs (customer_id, title, body, data, status, provider_response) VALUES ($1,$2,$3,$4,$5,$6)',
      [row.customer_id, title, body, data, result.skipped ? 'skipped' : 'sent', result],
    );
  }

  return { ...result, targetCount: tokens.length };
}

module.exports = { registerDeviceToken, sendToCustomer, broadcast };
