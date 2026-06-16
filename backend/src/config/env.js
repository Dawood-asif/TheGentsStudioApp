require('dotenv').config();

const toBool = value => String(value).toLowerCase() === 'true';
const toNumber = (value, fallback) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

module.exports = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: toNumber(process.env.PORT, 5000),
  databaseUrl: process.env.DATABASE_URL || 'postgresql://gentsstudio:gentsstudio_dev_password@localhost:5432/gentsstudio',
  databaseSsl: toBool(process.env.DATABASE_SSL),
  jwtSecret: process.env.JWT_SECRET || 'dev_access_secret_change_me',
  refreshTokenSecret: process.env.REFRESH_TOKEN_SECRET || 'dev_refresh_secret_change_me',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '1d',
  refreshTokenExpiresDays: toNumber(process.env.REFRESH_TOKEN_EXPIRES_DAYS, 7),
  corsOrigins: (process.env.CORS_ORIGINS || 'http://localhost:5173,http://localhost:3000')
    .split(',')
    .map(origin => origin.trim())
    .filter(Boolean),
  adminEmail: process.env.ADMIN_EMAIL || 'admin@thegentsstudio.com',
  adminPassword: process.env.ADMIN_PASSWORD || 'Admin@2024',
  bcryptSaltRounds: toNumber(process.env.BCRYPT_SALT_ROUNDS, 10),
  rateLimitWindowMs: toNumber(process.env.RATE_LIMIT_WINDOW_MS, 15 * 60 * 1000),
  rateLimitMax: toNumber(process.env.RATE_LIMIT_MAX, 100),

  // Staff tablet / scanner security
  staffDeviceApiKey: process.env.STAFF_DEVICE_API_KEY || 'demo_staff_device_key_change_me',

  // OTP provider: demo | twilio | whatsapp
  otpProvider: process.env.OTP_PROVIDER || 'demo',
  otpExpiryMinutes: toNumber(process.env.OTP_EXPIRY_MINUTES, 10),
  twilioAccountSid: process.env.TWILIO_ACCOUNT_SID || '',
  twilioAuthToken: process.env.TWILIO_AUTH_TOKEN || '',
  twilioFromNumber: process.env.TWILIO_FROM_NUMBER || '',
  twilioMessagingServiceSid: process.env.TWILIO_MESSAGING_SERVICE_SID || '',
  whatsappCloudToken: process.env.WHATSAPP_CLOUD_TOKEN || '',
  whatsappPhoneNumberId: process.env.WHATSAPP_PHONE_NUMBER_ID || '',

  // Firebase Cloud Messaging
  firebaseServiceAccountJson: process.env.FIREBASE_SERVICE_ACCOUNT_JSON || '',
  firebaseServiceAccountPath: process.env.FIREBASE_SERVICE_ACCOUNT_PATH || '',
};
