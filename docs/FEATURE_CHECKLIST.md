# Feature Checklist

## Customer App

- [x] Splash screen scaffold with black/gold theme
- [x] Signup screen scaffold: name, WhatsApp phone, email, birthday, terms, real backend OTP step
- [x] Home screen scaffold: greeting, stamps, progress bar, real scannable QR card, quick actions
- [x] Services screen scaffold: categories, 54 service records, package builder
- [x] Package builder scaffold: 20% discount for 2+ services
- [x] AI assistant scaffold: salon Q&A, suggested questions, no staff names
- [x] Leaderboard scaffold: today/week/month/all filters, rank cards
- [x] Profile scaffold: stats, referral code, share-ready text
- [x] Dark mode persistence scaffold
- [x] Offline sync queue utility scaffold
- [x] Staff tablet QR scanner screen
- [x] Appointment request calendar screen
- [x] Firebase push registration helper
- [x] Gold shimmer splash animation
- [x] Haptic feedback on buttons

## Backend API

- [x] Health check
- [x] Admin login/logout with JWT and refresh token tables
- [x] Token blacklist table support
- [x] Customers CRUD
- [x] Services CRUD
- [x] Staff CRUD
- [x] Appointment CRUD/status update
- [x] Stamp addition with one-per-day anti-cheat
- [x] Points and stamp transaction history
- [x] Weekly streak reward service
- [x] Leaderboard time filters
- [x] Dashboard analytics
- [x] Settings API
- [x] Referral reward route scaffold
- [x] OTP send/verify routes
- [x] Staff device QR scanner routes
- [x] Firebase notification routes
- [x] Calendar availability route

## Admin Panel

- [x] Login screen scaffold
- [x] Dashboard screen scaffold
- [x] Customers table scaffold
- [x] Services management scaffold
- [x] Staff management scaffold
- [x] Appointments scaffold
- [x] Inventory scaffold
- [x] Settings scaffold
- [x] CSV export helper scaffold

## Production Tasks Remaining

- [ ] Add real WhatsApp/SMS OTP provider credentials
- [ ] Add Firebase Cloud Messaging server credentials
- [ ] Add Cloudinary/Firebase Storage credentials if media uploads are needed
- [ ] Enroll actual admin 2FA secret in production
- [ ] Configure production HTTPS domain and CORS whitelist
- [ ] Build and sign final Android APK/AAB
