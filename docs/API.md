# Backend API Reference

Base URL: `https://your-backend-domain.com`

Local URL: `http://localhost:5000`

All admin routes require `Authorization: Bearer <accessToken>` unless stated public.

## Health

### GET `/health`

Returns API status.

## Auth

### POST `/api/auth/login`

Body:

```json
{
  "email": "admin@thegentsstudio.com",
  "password": "Admin@2024",
  "twoFactorCode": "123456"
}
```

Returns access token, refresh token, and admin profile.

### POST `/api/auth/logout`

Headers: Authorization bearer token.

Body:

```json
{ "refreshToken": "..." }
```

Blacklists current token and deletes refresh token.

## OTP

### POST `/api/otp/send`

Public. Sends OTP through configured provider: `demo`, `twilio`, or `whatsapp`.

```json
{
  "phone": "03015092782",
  "purpose": "signup"
}
```

### POST `/api/otp/verify`

Public.

```json
{
  "phone": "03015092782",
  "code": "123456",
  "purpose": "signup"
}
```

## Customers

### GET `/api/customers?search=ali`

List customers.

### GET `/api/customers/:id`

Single customer with recent stamp transactions.

### POST `/api/customers` public

Create customer/signup.

```json
{
  "fullName": "Ali Khan",
  "phone": "03001234567",
  "email": "ali@example.com",
  "birthday": "1998-04-20",
  "termsAccepted": true,
  "referredByCode": "GENTSABC123"
}
```

### PUT `/api/customers/:id`

Update profile/admin fields.

### DELETE `/api/customers/:id`

Delete customer.

## Services

### GET `/api/services?category=Haircuts`

List services.

### POST `/api/services`

Create service.

### PUT `/api/services/:id`

Update service.

### DELETE `/api/services/:id`

Soft-delete/deactivate service.

## Staff

### GET `/api/staff`

List active staff.

### POST `/api/staff`

Create staff.

### PUT `/api/staff/:id`

Update staff.

## Appointments

### GET `/api/appointments?status=pending`

List appointments.

### POST `/api/appointments`

Create appointment/walk-in record.

### PUT `/api/appointments/:id/status`

Body:

```json
{ "status": "completed" }
```

## Stamps

### POST `/api/stamps/add`

Adds one visit stamp and 100 points unless the customer already received a visit stamp that day.

Body can identify customer by `customerId`, `customerCode`, or `phone`.

```json
{
  "customerId": "uuid",
  "serviceId": "uuid",
  "appointmentId": "uuid",
  "note": "QR scan visit"
}
```

Response includes updated customer, reward alerts, and streak milestone if any.

## Staff Device QR Scanner

### POST `/api/staff-device/stamps/add`

Protected by header `x-staff-device-key`.

```json
{
  "customerCode": "GST-20260616-ABCD",
  "note": "Staff tablet QR scan"
}
```

### POST `/api/staff-device/offline-sync`

Protected by header `x-staff-device-key`. Syncs offline staff tablet actions.

```json
{
  "deviceId": "tablet-01",
  "actions": [
    { "localId": "1", "type": "ADD_STAMP", "payload": { "customerCode": "GST-..." } }
  ]
}
```

## Calendar

### GET `/api/calendar/slots?date=2026-06-16`

Returns available 30-minute request slots from 8 AM to 9 PM. Final confirmation is by phone.

## Notifications

### POST `/api/notifications/register-token`

Registers a Firebase Cloud Messaging device token.

### POST `/api/notifications/send-test`

Admin only. Sends test push to one customer.

### POST `/api/notifications/broadcast`

Admin only. Sends marketing broadcast to all enabled tokens.

## Leaderboard

### GET `/api/leaderboard?period=week`

Supported `period`: `today`, `week`, `month`, `all`.

## Reports

### GET `/api/reports/dashboard`

Returns totals for dashboard cards.

## Referrals

### POST `/api/referrals/apply`

Apply referral reward after friend's first eligible visit.

```json
{
  "friendCustomerId": "uuid",
  "referralCode": "GENTSABC123"
}
```

## Settings

### GET `/api/settings`

Get business settings.

### PUT `/api/settings/:key`

Update one setting.

```json
{ "value": { "stampsNeeded": 10, "rewardType": "FREE_SERVICE" } }
```
