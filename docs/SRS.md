# Software Requirements Specification

## 1. Product

**The Gents Studio & Spa** is a black-and-gold ultra-luxury salon app for male customers only. The application supports loyalty stamps, points, streak rewards, referrals, QR-based stamp addition, package building, AI salon Q&A, offline staff tablet support, backend APIs, and a web admin panel.

## 2. Users

### Customer

- Creates account using full name, WhatsApp phone, email, birthday, terms agreement, and OTP verification.
- Views services and package builder.
- Tracks stamps, points, streaks, leaderboard rank, QR code, and referral code.
- Uses AI salon assistant.

### Staff / Owner

- Scans customer QR or searches customer to add stamps.
- Uses offline walk-in queue when internet is unavailable.
- Calls customers/staff manually as needed.

### Admin

- Logs into admin panel with email/password and optional Google Authenticator 2FA.
- Manages customers, stamps, services, staff, appointments, inventory, settings, exports, notifications.

## 3. Business Rules

1. One stamp per customer per calendar day from normal visit stamps.
2. Default reward is 10 stamps = free service.
3. Each stamp gives 100 points.
4. Streak milestones:
   - 2 weeks: 50 points
   - 4 weeks: 100 points + 1 stamp
   - 6 weeks: 200 points + 2 stamps
   - 8 weeks: 500 points + 3 stamps
   - 10 weeks: free service flag
5. Referral rewards:
   - Referrer receives +2 stamps and +200 points.
   - Friend receives 20% off first visit.
6. Custom packages receive 20% discount when 2 or more services are selected.
7. Customers cannot select staff inside the app; booking is by phone only.
8. No service durations are shown.
9. No online cancellation; customer must call.
10. AI assistant must never mention specific staff names.
11. Business hours, phones, address, loyalty rules, and reward types are editable by admin.
12. Closed holidays: 9th and 10th Muharram.

## 4. Functional Requirements

### Signup & Profile

- Required fields: full name, WhatsApp phone, email, birthday, terms agreement.
- OTP verification is designed as a provider integration point.
- System generates customer code, referral code, join date, and last login.

### Loyalty

- QR or admin scan adds a visit stamp.
- Anti-cheat checks existing visit stamp on the same date.
- Stamp, point, and streak histories are stored in transactions.

### Services

- Admin can add, edit, delete, and activate/deactivate services.
- Customer can filter services by category.
- 54 seed service records are included in the scaffold.

### Package Builder

- Customer can select any services.
- Subtotal, discount, and total are calculated in real time.
- Favorite/share/use package flows are scaffolded.

### AI Assistant

- Provides salon information, prices, hours, location, loyalty rules, referrals, and general salon history.
- Refuses to name staff members and redirects to salon phone booking.

### Offline Mode

- Offline queue stores pending actions locally.
- Sync utility posts pending items when internet returns.
- Offline appointment and stamp actions can be queued.

### Admin Panel

- Dashboard shows core metrics.
- Customer management supports search and manual stamp edits.
- Service/staff/appointment/inventory/settings modules are scaffolded.
- CSV export is supported from the customer table.

## 5. Non-Functional Requirements

- JWT access token expiration: 1 day.
- Refresh token expiration: 7 days.
- Admin session timeout target: 30 minutes in UI.
- Rate limit: 100 requests per 15 minutes per IP.
- Password hashing: bcrypt.
- HTTP hardening: Helmet secure headers.
- CORS whitelist configurable by environment.
- Offline sensitive storage should be encrypted with AES-256 in production.
- HTTPS required in production.

## 6. Deployment

- Backend: Render.com or similar Node hosting.
- Database: Supabase PostgreSQL.
- Admin panel: Netlify or Vercel.
- Push: Firebase Cloud Messaging.
- Storage: Cloudinary or Firebase Storage.
