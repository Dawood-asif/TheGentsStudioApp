# The Gents Studio & Spa — Full Source Scaffold

Ultra-luxury black + gold salon loyalty, booking, admin, and backend scaffold for **The Gents Studio & Spa**.

## Project Structure

```text
TheGentsStudioApp/
├── mobile/      # React Native 0.72 customer/staff tablet app scaffold
├── backend/     # Node.js + Express + PostgreSQL REST API scaffold
├── admin/       # React admin panel scaffold
├── database/    # PostgreSQL schema and seed helpers
└── docs/        # SRS, API, database, deployment, security docs
```

## Brand & Business

- **App name:** The Gents Studio & Spa
- **Theme:** Black `#0A0A0A` + Gold `#D4AF37`
- **Audience:** Males only — children, adults, elderly
- **Address:** Shop street 18, Mehar Fiaz Colony Bb, Lahore, 54000, Pakistan
- **Phones:** 0301 5092782, 0335 2279567
- **Hours:** 8:00 AM – 9:00 PM, editable from admin
- **Closed:** 9th and 10th Muharram

## Included Features

- Customer signup with phone OTP-ready flow, profile, unique customer ID, referral code
- Stamp loyalty: 1 stamp per visit, anti-cheat 1 stamp/day, 10 stamps = free service by default
- Points: 100 points per stamp with history
- Weekly streaks with milestone rewards
- Leaderboard with time filters and VIP badges
- 54 service records seeded, including one clearly labeled admin-editable add-on placeholder because the provided table had 53 named services but specified 54+
- Custom package builder with automatic 20% discount when 2+ services selected
- AI salon assistant scaffold with strict no-staff-names rule
- Unique customer QR card scaffold
- Referral code sharing logic scaffold
- Offline sync queue scaffold for staff tablet mode
- Real scannable QR code generation and staff/admin QR scanner code
- OTP provider integration for demo, Twilio SMS, or WhatsApp Cloud API
- Firebase push notification registration and admin broadcast code
- Appointment request calendar with backend slot availability
- Ultra-luxury Reanimated motion layer: gold particle splash, animated backgrounds, shimmer buttons, animated tab icons, skeleton loaders, animated cards, stamp celebration sparks
- Admin panel scaffold: dashboard, customers, services, staff, appointments, inventory, QR scanner, notifications, settings
- Backend security: Helmet, CORS, rate limits, JWT, refresh tokens, token blacklist, bcrypt, 2FA-ready admin login

## Quick Start — Backend

```bash
cd backend
cp .env.example .env
npm install
npm run db:schema     # requires DATABASE_URL in .env
npm run seed          # creates admin and seed services/staff/settings
npm run dev
```

Default seeded admin:

```text
Email: admin@thegentsstudio.com
Password: Admin@2024
```

> Change this password immediately before any real deployment.

## Quick Start — Admin Panel

```bash
cd admin
cp .env.example .env
npm install
npm run dev
```

## Quick Start — Mobile

```bash
cd mobile
cp .env.example .env
npm install --legacy-peer-deps
npm run android
```

## Deployment Targets

- Backend: Render.com (`render.yaml` included)
- Admin: Netlify or Vercel (`admin/netlify.toml` included)
- Database: Supabase PostgreSQL (`database/schema.sql` + `database/seed.sql` included)
- Push notifications: Firebase Cloud Messaging
- File storage: Cloudinary or Firebase Storage

## Launch Helpers

```bash
node scripts/generate-secrets.js
./scripts/preflight.sh
DATABASE_URL='postgresql://...' ./scripts/deploy-database.sh
VITE_API_URL='https://your-api.onrender.com' ./scripts/deploy-admin-netlify.sh
API_URL='https://your-api.onrender.com' ./scripts/verify-live-stack.sh
API_URL='https://your-api.onrender.com' ./scripts/build-debug-apk-local.sh ~/TheGentsStudioMobile
```

## Important Business Rules Captured

- No online cancellation; customer must call
- No service durations shown
- Customer cannot select staff in app; booking by phone only
- AI assistant must never name specific staff members
- No female customer flow
- No private-room massage flow
- Owner/admin can manually edit stamps, prices, staff, settings

## Next Steps for Production

1. Add real Twilio or WhatsApp Cloud API credentials in backend `.env`.
2. Add Firebase Cloud Messaging keys and native mobile Firebase files.
3. Configure production `DATABASE_URL`, `JWT_SECRET`, `REFRESH_TOKEN_SECRET`, `STAFF_DEVICE_API_KEY`, and CORS domains.
4. Enable real admin 2FA secret enrollment.
5. Build Android signed release with your keystore.
6. Test QR scanner on actual Android staff tablet camera.
