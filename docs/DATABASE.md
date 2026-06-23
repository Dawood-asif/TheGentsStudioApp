# Database Design

The database is PostgreSQL. The schema is in `database/schema.sql`.

## Tables

1. `customers` — customer identity, contact, birthday, stamps, points, visits, referral code, streaks.
2. `staff` — staff profiles, specialties, rating, commission, active flag.
3. `services` — service catalog with category and PKR price.
4. `appointments` — booking/walk-in records and package total.
5. `stamp_transactions` — stamp and point history.
6. `referrals` — referral tracking between referrer and friend.
7. `inventory` — supplies stock management.
8. `settings` — editable business and loyalty configuration.
9. `admin_users` — admin login accounts with bcrypt password hashes and optional 2FA secret.
10. `security_logs` — audit trail for login attempts, CRUD, stamp changes.
11. `token_blacklist` — invalidated JWT IDs/tokens until expiration.
12. `refresh_tokens` — refresh session records.
13. `reviews` — customer feedback.
14. `offline_sync_queue` — server-side record of synced/failed offline actions.
15. `otp_codes` — OTP requests, hashes, expiry, and verification status.
16. `device_tokens` — Firebase Cloud Messaging tokens per customer/device.
17. `notification_logs` — push notification delivery audit logs.

## Important Indexes

- Unique customer phone, email, customer code, referral code.
- Stamp transaction lookup by customer and date.
- Leaderboard index by points.
- Appointment date/status index.
- Token blacklist token hash index.

## Seed Data

Run from backend:

```bash
npm run db:schema
npm run seed
```

Seed inserts:

- 54 services
- 7 staff
- business settings
- default admin user
