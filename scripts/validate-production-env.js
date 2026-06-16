const requiredBackend = [
  'DATABASE_URL',
  'JWT_SECRET',
  'REFRESH_TOKEN_SECRET',
  'STAFF_DEVICE_API_KEY',
  'CORS_ORIGINS',
];

const optionalOtpByProvider = {
  demo: [],
  twilio: ['TWILIO_ACCOUNT_SID', 'TWILIO_AUTH_TOKEN'],
  whatsapp: ['WHATSAPP_CLOUD_TOKEN', 'WHATSAPP_PHONE_NUMBER_ID'],
};

const provider = process.env.OTP_PROVIDER || 'demo';
const requiredOtp = optionalOtpByProvider[provider] || [];
const firebaseRequired = process.env.ENABLE_FIREBASE_CHECK === 'true'
  ? ['FIREBASE_SERVICE_ACCOUNT_JSON']
  : [];

const missing = [...requiredBackend, ...requiredOtp, ...firebaseRequired].filter(key => !process.env[key]);

if (missing.length) {
  console.error('Missing required production environment variables:');
  for (const key of missing) console.error(`- ${key}`);
  process.exit(1);
}

if (provider === 'demo' && process.env.NODE_ENV === 'production') {
  console.warn('WARNING: OTP_PROVIDER=demo in production. Use twilio or whatsapp before public launch.');
}

console.log('Production environment validation passed.');
console.log(`OTP provider: ${provider}`);
console.log(`Firebase check: ${process.env.ENABLE_FIREBASE_CHECK === 'true' ? 'enabled' : 'skipped'}`);
