# The Gents Studio & Spa — Exact Launch / Deployment Commands

Boss, this is the copy-paste launch guide for Supabase + Render + Netlify + Firebase/Twilio + APK build.

> Important: I cannot deploy without your private accounts/API keys. Follow these steps and paste your real values where marked.

---

## 0. Files You Need

Main project folder:

```bash
TheGentsStudioApp/
```

Complete ZIP:

```bash
TheGentsStudioApp-scaffold.zip
```

---

## 1. Generate Strong Secrets

Run locally:

```bash
node scripts/generate-secrets.js
```

Or run these one by one:

```bash
node -e "console.log('JWT_SECRET=' + require('crypto').randomBytes(48).toString('hex'))"
node -e "console.log('REFRESH_TOKEN_SECRET=' + require('crypto').randomBytes(48).toString('hex'))"
node -e "console.log('STAFF_DEVICE_API_KEY=' + require('crypto').randomBytes(32).toString('hex'))"
```

Save the 3 generated values. You will add them to Render.

---

## 2. Supabase Database Deployment

### 2.1 Create Database

1. Go to: https://supabase.com/
2. Create a new project.
3. Save your database password.
4. Go to **Project Settings → Database → Connection string**.
5. Copy the **URI** connection string.

It will look like:

```text
postgresql://postgres.xxxxx:PASSWORD@aws-0-region.pooler.supabase.com:6543/postgres
```

### 2.2 Apply Schema from Your Computer

Inside the project root:

```bash
cd TheGentsStudioApp/backend
cp .env.example .env
```

Edit `.env`:

```env
DATABASE_URL=YOUR_SUPABASE_CONNECTION_STRING
DATABASE_SSL=true
```

Then run:

```bash
npm install
npm run db:schema
npm run seed
```

Alternative manual Supabase SQL Editor method:

1. Paste and run `database/schema.sql`.
2. Paste and run `database/seed.sql`.

This creates tables, services, staff, settings, and admin login.

Default admin:

```text
Email: admin@thegentsstudio.com
Password: Admin@2024
```

Change this after first login.

---

## 3. Render Backend Deployment

### 3.1 Push Project to GitHub

From the folder that contains `TheGentsStudioApp`:

```bash
cd TheGentsStudioApp
git init
git add .
git commit -m "Initial The Gents Studio app"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/TheGentsStudioApp.git
git push -u origin main
```

### 3.2 Create Render Web Service

This project now includes a Render Blueprint file:

```text
render.yaml
```

You can use either **Blueprint** or **Manual Web Service**.

1. Go to: https://render.com/
2. New → Web Service or Blueprint.
3. Connect your GitHub repo.
4. If manual, set:

```text
Root Directory: backend
Runtime: Node
Build Command: npm install
Start Command: npm start
Health Check Path: /health
```

### 3.3 Render Environment Variables

Add these in Render → Environment:

```env
NODE_ENV=production
PORT=10000
DATABASE_URL=YOUR_SUPABASE_CONNECTION_STRING
DATABASE_SSL=true
JWT_SECRET=YOUR_GENERATED_JWT_SECRET
REFRESH_TOKEN_SECRET=YOUR_GENERATED_REFRESH_SECRET
JWT_EXPIRES_IN=1d
REFRESH_TOKEN_EXPIRES_DAYS=7
CORS_ORIGINS=https://YOUR_NETLIFY_SITE.netlify.app,http://localhost:5173
ADMIN_EMAIL=admin@thegentsstudio.com
ADMIN_PASSWORD=Admin@2024
BCRYPT_SALT_ROUNDS=10
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX=100
STAFF_DEVICE_API_KEY=YOUR_GENERATED_STAFF_DEVICE_KEY
OTP_PROVIDER=demo
OTP_EXPIRY_MINUTES=10
```

Deploy.

### 3.4 Test Backend

Open:

```text
https://YOUR_RENDER_BACKEND.onrender.com/health
```

Expected result:

```json
{
  "success": true,
  "status": "ok"
}
```

---

## 4. Netlify Admin Panel Deployment

### 4.1 Create Netlify Site

This project now includes Netlify config:

```text
admin/netlify.toml
```

1. Go to: https://www.netlify.com/
2. Add new site → Import from Git.
3. Connect same GitHub repo.
4. Set:

```text
Base directory: admin
Build command: npm run build
Publish directory: admin/dist
```

If Netlify asks publish directory relative to base directory, use:

```text
dist
```

### 4.2 Netlify Environment Variable

Add:

```env
VITE_API_URL=https://YOUR_RENDER_BACKEND.onrender.com
```

Deploy.

### 4.3 Update Render CORS

After Netlify gives your URL, update Render:

```env
CORS_ORIGINS=https://YOUR_NETLIFY_SITE.netlify.app,http://localhost:5173
```

Redeploy backend.

---

## 5. OTP Setup

You have 3 options.

### Option A — Demo OTP

For testing only:

```env
OTP_PROVIDER=demo
```

The backend returns/logs the OTP code.

### Option B — Twilio SMS OTP

Create Twilio account: https://www.twilio.com/

Render env variables:

```env
OTP_PROVIDER=twilio
TWILIO_ACCOUNT_SID=YOUR_TWILIO_ACCOUNT_SID
TWILIO_AUTH_TOKEN=YOUR_TWILIO_AUTH_TOKEN
TWILIO_FROM_NUMBER=+1XXXXXXXXXX
```

Or if using Messaging Service:

```env
TWILIO_MESSAGING_SERVICE_SID=MGxxxxxxxxxxxxxxxx
```

### Option C — WhatsApp Cloud API OTP

Create Meta app: https://developers.facebook.com/

Render env variables:

```env
OTP_PROVIDER=whatsapp
WHATSAPP_CLOUD_TOKEN=YOUR_META_WHATSAPP_TOKEN
WHATSAPP_PHONE_NUMBER_ID=YOUR_PHONE_NUMBER_ID
```

---

## 6. Firebase Push Notifications Setup

### 6.1 Firebase Project

1. Go to: https://firebase.google.com/
2. Create project.
3. Add Android app.
4. Download:

```text
google-services.json
```

Place it in the real React Native Android app here:

```text
mobile/android/app/google-services.json
```

### 6.2 Backend Firebase Service Account

Firebase Console → Project Settings → Service Accounts → Generate new private key.

Copy the JSON content and add to Render as one-line JSON:

```env
FIREBASE_SERVICE_ACCOUNT_JSON={"type":"service_account",...}
```

Alternative if hosting supports secret file:

```env
FIREBASE_SERVICE_ACCOUNT_PATH=/path/to/firebase-service-account.json
```

### 6.3 Mobile Native Firebase Setup

In `mobile/android/build.gradle`, add Google services plugin dependency:

```gradle
buildscript {
    dependencies {
        classpath 'com.google.gms:google-services:4.4.2'
    }
}
```

In `mobile/android/app/build.gradle`, add:

```gradle
apply plugin: 'com.google.gms.google-services'
```

---

## 7. Android APK Build

Important: the current workspace contains the React Native source scaffold. If your `mobile` folder does not yet have native `android/` files, initialize React Native first.

### 7.1 Initialize Native React Native Project

From any working folder:

```bash
npx react-native@0.72.3 init TheGentsStudioMobile --version 0.72.3
```

Copy scaffold files into it:

```bash
cp -R TheGentsStudioApp/mobile/src TheGentsStudioMobile/
cp TheGentsStudioApp/mobile/package.json TheGentsStudioMobile/package.json
cp TheGentsStudioApp/mobile/app.json TheGentsStudioMobile/app.json
cp TheGentsStudioApp/mobile/index.js TheGentsStudioMobile/index.js
cp TheGentsStudioApp/mobile/babel.config.js TheGentsStudioMobile/babel.config.js
```

Then:

```bash
cd TheGentsStudioMobile
npm install --legacy-peer-deps
```

### 7.2 Android Permissions

Edit:

```text
android/app/src/main/AndroidManifest.xml
```

Add:

```xml
<uses-permission android:name="android.permission.INTERNET" />
<uses-permission android:name="android.permission.CAMERA" />
<uses-permission android:name="android.permission.POST_NOTIFICATIONS" />
```

### 7.3 Enable VisionCamera QR Scanner

Edit:

```text
android/gradle.properties
```

Add:

```properties
VisionCamera_enableCodeScanner=true
```

### 7.4 Set Backend URL in Mobile

Edit:

```text
src/api/client.js
```

Change:

```js
const API_URL = 'http://10.0.2.2:5000';
```

to:

```js
const API_URL = 'https://YOUR_RENDER_BACKEND.onrender.com';
```

### 7.5 Debug APK

```bash
cd android
./gradlew assembleDebug
```

Debug APK path:

```text
android/app/build/outputs/apk/debug/app-debug.apk
```

### 7.6 Release APK Signing

Generate keystore:

```bash
keytool -genkeypair -v -storetype PKCS12 -keystore gents-release-key.keystore -alias gents-key-alias -keyalg RSA -keysize 2048 -validity 10000
```

Move keystore:

```bash
mv gents-release-key.keystore android/app/
```

Edit:

```text
android/gradle.properties
```

Add:

```properties
MYAPP_UPLOAD_STORE_FILE=gents-release-key.keystore
MYAPP_UPLOAD_KEY_ALIAS=gents-key-alias
MYAPP_UPLOAD_STORE_PASSWORD=YOUR_KEYSTORE_PASSWORD
MYAPP_UPLOAD_KEY_PASSWORD=YOUR_KEY_PASSWORD
```

Edit `android/app/build.gradle` and add signing config if not already present:

```gradle
android {
    signingConfigs {
        release {
            if (project.hasProperty('MYAPP_UPLOAD_STORE_FILE')) {
                storeFile file(MYAPP_UPLOAD_STORE_FILE)
                storePassword MYAPP_UPLOAD_STORE_PASSWORD
                keyAlias MYAPP_UPLOAD_KEY_ALIAS
                keyPassword MYAPP_UPLOAD_KEY_PASSWORD
            }
        }
    }
    buildTypes {
        release {
            signingConfig signingConfigs.release
            minifyEnabled false
            shrinkResources false
        }
    }
}
```

Build release APK:

```bash
cd android
./gradlew clean
./gradlew assembleRelease
```

Release APK path:

```text
android/app/build/outputs/apk/release/app-release.apk
```

---

## 8. Staff Tablet Setup

On backend Render env:

```env
STAFF_DEVICE_API_KEY=YOUR_GENERATED_STAFF_DEVICE_KEY
```

On staff tablet app:

1. Open `Scan` tab.
2. Enter same staff key.
3. Save.
4. Scan customer QR.

---

## 9. Final Smoke Test Checklist

### Backend

```bash
curl https://YOUR_RENDER_BACKEND.onrender.com/health
```

### Admin

1. Open Netlify admin URL.
2. Login:

```text
admin@thegentsstudio.com
Admin@2024
```

3. Check dashboard.
4. Check services list.
5. Test QR scanner manual customer code.

### Mobile

1. Install APK on Infinix.
2. Signup with OTP.
3. View services.
4. Create package.
5. View QR.
6. Staff tablet scans QR.
7. Stamp increases.
8. Push notification test from admin.
9. Booking calendar request.

---

## 10. Production Security Checklist

Before public launch:

- Change default admin password.
- Enable admin 2FA.
- Use strong JWT secrets.
- Use strong staff device key.
- Set `OTP_PROVIDER=twilio` or `whatsapp`, not `demo`.
- Keep Supabase database password private.
- Keep Firebase service account private.
- Use HTTPS Render and Netlify URLs only.
- Restrict CORS to final admin domain.
- Backup database regularly.

---

## Quick Launch Summary

```bash
# 1. Supabase: create DB and copy DATABASE_URL

# 2. Backend local schema/seed
cd TheGentsStudioApp/backend
cp .env.example .env
# edit .env DATABASE_URL and DATABASE_SSL=true
npm install
npm run db:schema
npm run seed

# 3. Push to GitHub
cd ..
git init
git add .
git commit -m "Launch ready salon app"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/TheGentsStudioApp.git
git push -u origin main

# 4. Render backend
# Root: backend | Build: npm install | Start: npm start

# 5. Netlify admin
# Base: admin | Build: npm run build | Publish: dist

# 6. Mobile APK
npx react-native@0.72.3 init TheGentsStudioMobile --version 0.72.3
# copy mobile files, add permissions, set API_URL, add Firebase file
cd TheGentsStudioMobile
npm install --legacy-peer-deps
cd android
./gradlew assembleRelease
```
