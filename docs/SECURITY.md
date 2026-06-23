# Security Plan

## Implemented in Scaffold

- `helmet` secure HTTP headers.
- Configurable CORS whitelist.
- Global rate limit: 100 requests / 15 minutes / IP.
- JWT access tokens with 1 day expiration.
- Refresh token table with 7 day expiration.
- Logout token blacklist.
- bcrypt password hashing.
- Input validation/sanitization helpers.
- Admin 2FA-ready login with TOTP (`speakeasy`).
- Security log table for audit events.

## Production Requirements

- HTTPS only with TLS 1.3 where possible.
- Database SSL enabled.
- Long random secrets in environment variables.
- Real SMS/WhatsApp OTP provider with rate limits.
- AES-256 encrypted offline storage for sensitive staff tablet data.
- Admin inactivity timeout of 30 minutes in UI.
- Restrict admin panel by strong passwords and 2FA.
- Never commit `.env`, keystores, Firebase private keys, or Cloudinary secrets.

## Sensitive Offline Data

The mobile scaffold includes an offline queue abstraction. For production, wrap stored payloads with encryption using a secure keychain-backed library, for example:

- `react-native-keychain` for key storage
- AES-256-GCM encryption library for data payloads
- Per-device key rotation and remote logout support
