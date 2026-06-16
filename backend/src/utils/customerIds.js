const crypto = require('crypto');

function randomAlphaNum(length = 6) {
  return crypto.randomBytes(length).toString('hex').slice(0, length).toUpperCase();
}

function generateCustomerCode() {
  const date = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  return `GST-${date}-${randomAlphaNum(4)}`;
}

function generateReferralCode() {
  return `GENTS${randomAlphaNum(6)}`;
}

module.exports = { generateCustomerCode, generateReferralCode };
