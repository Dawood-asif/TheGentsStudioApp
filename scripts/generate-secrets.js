const crypto = require('crypto');

function secret(bytes = 48) {
  return crypto.randomBytes(bytes).toString('hex');
}

console.log('Copy these values into Render environment variables:\n');
console.log(`JWT_SECRET=${secret(48)}`);
console.log(`REFRESH_TOKEN_SECRET=${secret(48)}`);
console.log(`STAFF_DEVICE_API_KEY=${secret(32)}`);
console.log('\nDo not commit these values to GitHub.');
