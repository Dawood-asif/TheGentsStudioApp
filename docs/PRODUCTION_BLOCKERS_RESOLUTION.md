# Production Blockers Resolution

This file directly addresses the 4 remaining launch blockers.

## 1. Not Deployed to Cloud — Prepared for Deployment

### Supabase

Ready files:

- `database/schema.sql`
- `database/seed.sql`
- `scripts/deploy-database.sh`
- `.github/workflows/deploy-database.yml`

Run locally after creating a Supabase project:

```bash
DATABASE_URL='YOUR_SUPABASE_DATABASE_URL' ./scripts/deploy-database.sh
```

Or use GitHub Actions after adding repository secret:

```text
SUPABASE_DATABASE_URL
```

Then run workflow:

```text
Deploy Database to Supabase
```

### Render

Ready files:

- `render.yaml`
- `backend/Dockerfile`
- `backend/Procfile`
- `.github/workflows/deploy-render.yml`

Render can deploy from GitHub using the included blueprint.

Optional GitHub secret for deploy hook:

```text
RENDER_DEPLOY_HOOK_URL
```

### Netlify

Ready files:

- `admin/netlify.toml`
- `scripts/deploy-admin-netlify.sh`
- `.github/workflows/deploy-admin-netlify.yml`

Run locally:

```bash
VITE_API_URL='https://YOUR_RENDER_BACKEND.onrender.com' ./scripts/deploy-admin-netlify.sh
```

For automatic GitHub deployment, add secrets:

```text
NETLIFY_AUTH_TOKEN
NETLIFY_SITE_ID
VITE_API_URL
```

## 2. No Real OTP Provider Keys — Code Ready, Keys Required

Backend supports:

```env
OTP_PROVIDER=demo
OTP_PROVIDER=twilio
OTP_PROVIDER=whatsapp
```

### Twilio Required Render Env

```env
OTP_PROVIDER=twilio
TWILIO_ACCOUNT_SID=...
TWILIO_AUTH_TOKEN=...
TWILIO_FROM_NUMBER=...
```

Optional:

```env
TWILIO_MESSAGING_SERVICE_SID=...
```

### WhatsApp Cloud Required Render Env

```env
OTP_PROVIDER=whatsapp
WHATSAPP_CLOUD_TOKEN=...
WHATSAPP_PHONE_NUMBER_ID=...
```

Validation helper:

```bash
node scripts/validate-production-env.js
```

## 3. No Firebase Keys Configured — Code Ready, Keys Required

Backend push sender uses Firebase Cloud Messaging HTTP v1 with a service account.

Convert Firebase JSON to one-line Render env:

```bash
node scripts/firebase-service-account-to-env.js ~/Downloads/firebase-service-account.json
```

Copy output to Render:

```env
FIREBASE_SERVICE_ACCOUNT_JSON={...one-line-json...}
```

For Android build, add GitHub secret:

```text
GOOGLE_SERVICES_JSON_BASE64
```

Create it locally:

```bash
base64 -w 0 android/app/google-services.json
```

## 4. No APK Built or Tested on Real Phone — Build Automation Ready

### Option A: Build on GitHub Actions

Ready workflow:

```text
.github/workflows/android-apk.yml
```

Required secret:

```text
MOBILE_API_URL=https://YOUR_RENDER_BACKEND.onrender.com
```

Optional Firebase secret:

```text
GOOGLE_SERVICES_JSON_BASE64
```

For signed release APK, add:

```text
ANDROID_KEYSTORE_BASE64
ANDROID_KEYSTORE_PASSWORD
ANDROID_KEY_ALIAS
ANDROID_KEY_PASSWORD
```

Run workflow:

```text
Build Android APK
```

Download the APK from workflow artifacts.

### Option B: Build Locally

Requires JDK 17 + Android Studio SDK.

```bash
API_URL='https://YOUR_RENDER_BACKEND.onrender.com' ./scripts/build-debug-apk-local.sh ~/TheGentsStudioMobile
```

Debug APK output:

```text
~/TheGentsStudioMobile/android/app/build/outputs/apk/debug/app-debug.apk
```

## Live Verification

After deployment:

```bash
API_URL='https://YOUR_RENDER_BACKEND.onrender.com' \
ADMIN_URL='https://YOUR_ADMIN.netlify.app' \
./scripts/verify-live-stack.sh
```

Optional OTP test:

```bash
API_URL='https://YOUR_RENDER_BACKEND.onrender.com' \
TEST_PHONE='03015092782' \
./scripts/verify-live-stack.sh
```

## Honest Status

The code and automation for these blockers is now present. Actual completion still requires your private cloud accounts and secrets:

- Supabase account/database URL
- Render account/service
- Netlify account/site
- Twilio/WhatsApp credentials
- Firebase service account and Android config
- Real Android phone for install/testing

No AI agent can legitimately create or access those without your credentials.
