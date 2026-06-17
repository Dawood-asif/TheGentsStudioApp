const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const morgan = require('morgan');
const env = require('./config/env');
const { notFound, errorHandler } = require('./middleware/errorHandler');

const authRoutes = require('./routes/auth.routes');
const customerRoutes = require('./routes/customers.routes');
const serviceRoutes = require('./routes/services.routes');
const staffRoutes = require('./routes/staff.routes');
const appointmentRoutes = require('./routes/appointments.routes');
const stampRoutes = require('./routes/stamps.routes');
const leaderboardRoutes = require('./routes/leaderboard.routes');
const reportRoutes = require('./routes/reports.routes');
const referralRoutes = require('./routes/referrals.routes');
const settingsRoutes = require('./routes/settings.routes');
const inventoryRoutes = require('./routes/inventory.routes');
const offlineSyncRoutes = require('./routes/offlineSync.routes');
const otpRoutes = require('./routes/otp.routes');
const notificationRoutes = require('./routes/notifications.routes');
const staffDeviceRoutes = require('./routes/staffDevice.routes');
const calendarRoutes = require('./routes/calendar.routes');

const app = express();

// Required for Vercel/Netlify/Render proxies so express-rate-limit can read the real client IP safely.
app.set('trust proxy', 1);

app.use(helmet());
app.use(cors({
  origin(origin, callback) {
    if (!origin || env.corsOrigins.includes(origin)) return callback(null, true);
    return callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
}));
app.use(rateLimit({ windowMs: env.rateLimitWindowMs, max: env.rateLimitMax }));
app.use(express.json({ limit: '3mb' }));
app.use(morgan(env.nodeEnv === 'production' ? 'combined' : 'dev'));

app.get('/health', (_req, res) => {
  res.json({ success: true, status: 'ok', app: 'The Gents Studio & Spa API', timestamp: new Date().toISOString() });
});

app.use('/api/auth', authRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/staff', staffRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/stamps', stampRoutes);
app.use('/api/leaderboard', leaderboardRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/referrals', referralRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/offline-sync', offlineSyncRoutes);
app.use('/api/otp', otpRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/staff-device', staffDeviceRoutes);
app.use('/api/calendar', calendarRoutes);

app.use(notFound);
app.use(errorHandler);

module.exports = app;
