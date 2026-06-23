# Priority Fixes Applied

The critical flaws list was addressed in the source scaffold.

## 1. Real QR Code Generation + Scanning

### Mobile Customer QR

- Replaced fake 49-dot visual QR with `react-native-qrcode-svg`.
- File: `mobile/src/components/QRCard.js`
- QR payload:

```json
{
  "type": "GENTS_CUSTOMER",
  "customerId": "uuid-if-available",
  "customerCode": "GST-...",
  "app": "The Gents Studio & Spa"
}
```

### Staff Tablet Scanner

- Added real camera scanner using `react-native-vision-camera`.
- File: `mobile/src/screens/QRScannerScreen.js`
- Added `Scan` tab to mobile navigation.
- Scanner calls secure backend endpoint with `x-staff-device-key`.

### Admin Web Scanner

- Added browser camera QR scanner using the Web `BarcodeDetector` API.
- File: `admin/src/pages/QRScannerPage.jsx`
- Added `QR Scanner` page to admin navigation.

### Backend Scanner Endpoint

- Added staff device middleware: `backend/src/middleware/staffDeviceAuth.js`
- Added route: `POST /api/staff-device/stamps/add`
- Anti-cheat still blocks more than one visit stamp per day.

## 2. Real OTP Provider Integration

### Backend

- Added OTP table: `otp_codes`
- Added OTP service: `backend/src/services/otpService.js`
- Added endpoints:
  - `POST /api/otp/send`
  - `POST /api/otp/verify`

### Supported Providers

- `OTP_PROVIDER=demo` for development
- `OTP_PROVIDER=twilio` for Twilio SMS
- `OTP_PROVIDER=whatsapp` for WhatsApp Cloud API

### Mobile

- Signup screen now requests and verifies OTP through backend.
- File: `mobile/src/screens/SignupScreen.js`

## 3. Firebase Push Notifications

### Backend

- Added Firebase Cloud Messaging HTTP v1 sender using service account credentials, without extra Firebase Admin dependency.
- Added tables:
  - `device_tokens`
  - `notification_logs`
- Added service: `backend/src/services/notificationService.js`
- Added endpoints:
  - `POST /api/notifications/register-token`
  - `POST /api/notifications/send-test`
  - `POST /api/notifications/broadcast`

### Admin

- Added `Notifications` admin page to send marketing broadcasts.
- File: `admin/src/pages/NotificationsPage.jsx`

### Mobile

- Added Firebase Messaging registration helper.
- File: `mobile/src/utils/notifications.js`

## 4. Real Appointment Calendar

### Backend

- Added route: `GET /api/calendar/slots?date=YYYY-MM-DD`
- Generates 30-minute request slots from 8 AM to 9 PM.
- Marks pending/confirmed appointments as unavailable.

### Mobile

- Added `Book` tab with appointment slot selector.
- File: `mobile/src/screens/AppointmentCalendarScreen.js`
- Booking creates appointment request through existing `/api/appointments` route.
- Final confirmation and staff selection remain by phone.

## 5. Premium UI Polish

- Added gold shimmer splash animation.
- Added haptic feedback to gold buttons.

## Production Credentials Still Required

These features are coded, but real production operation needs credentials/configuration:

1. Twilio or WhatsApp Cloud API credentials for OTP.
2. Firebase project setup and service account for push notifications.
3. Android native camera/Firebase permissions and config files.
4. Strong `STAFF_DEVICE_API_KEY` in backend `.env` and saved on staff tablets.
5. Production HTTPS, database, and CORS settings.
