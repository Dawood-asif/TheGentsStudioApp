const crypto = require('crypto');
const xss = require('xss');

function hashToken(token) {
  return crypto.createHash('sha256').update(token).digest('hex');
}

function cleanString(value) {
  if (typeof value !== 'string') return value;
  return xss(value.trim());
}

function cleanObject(input) {
  if (!input || typeof input !== 'object') return input;
  if (Array.isArray(input)) return input.map(cleanObject);
  return Object.fromEntries(Object.entries(input).map(([key, value]) => [key, cleanObject(cleanString(value))]));
}

function getBearerToken(req) {
  const header = req.headers.authorization || '';
  if (!header.startsWith('Bearer ')) return null;
  return header.slice('Bearer '.length);
}

module.exports = { hashToken, cleanString, cleanObject, getBearerToken };
