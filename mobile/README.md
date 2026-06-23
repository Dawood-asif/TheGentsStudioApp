# Mobile App Scaffold

React Native 0.72.3 source scaffold for The Gents Studio & Spa.

## Run

```bash
cp .env.example .env
npm install --legacy-peer-deps
npm run android
```

This folder contains JS/React Native source. To create full native Android/iOS folders from scratch, initialize a React Native 0.72.3 project and copy this `src/`, `package.json`, `app.json`, `index.js`, and config files into it.

```bash
npx react-native@0.72.3 init TheGentsStudioMobile --version 0.72.3
```

Then copy the scaffold source and install dependencies.

## Ultra-Luxury Motion Upgrade

- `react-native-reanimated` is included for 60fps motion.
- Babel plugin is already configured in `babel.config.js` and must remain last.
- Added animated gold particle splash, animated luxury background, scale/ripple buttons, animated tab icons, shimmer skeletons, animated cards, and stamp celebration sparks.

If Metro cache causes issues after installing Reanimated:

```bash
npm start -- --reset-cache
cd android && ./gradlew clean
```

## Real QR Code Fix

- Customer QR now uses `react-native-qrcode-svg` and is scannable.
- Staff scanner screen uses `react-native-vision-camera` code scanner.
- Backend secure staff endpoint: `POST /api/staff-device/stamps/add` with `x-staff-device-key`.

Android permission required in `android/app/src/main/AndroidManifest.xml`:

```xml
<uses-permission android:name="android.permission.CAMERA" />
```

Enable VisionCamera code scanner in Android Gradle properties:

```properties
VisionCamera_enableCodeScanner=true
```

## Real OTP Fix

Signup calls backend OTP endpoints:

- `POST /api/otp/send`
- `POST /api/otp/verify`

Backend supports:

- `OTP_PROVIDER=demo`
- `OTP_PROVIDER=twilio`
- `OTP_PROVIDER=whatsapp`

## Firebase Push Fix

Mobile includes `@react-native-firebase/app` and `@react-native-firebase/messaging` registration helper.

Required production setup:

1. Add `google-services.json` to `android/app/`.
2. Configure Firebase Gradle plugin in native Android files.
3. Add backend `FIREBASE_SERVICE_ACCOUNT_JSON` or `FIREBASE_SERVICE_ACCOUNT_PATH`.
4. Use admin Notifications page to send broadcasts.

## Booking Calendar Fix

A `Book` tab was added. It loads backend slots from `/api/calendar/slots` and creates appointment requests. Final confirmation and staff selection are still by phone, matching the business rule.

## Production Additions

- Signed Android keystore
- Encrypted offline storage wrapper
- Real provider credentials for OTP and Firebase
- Staff device key provisioned securely on staff tablet
