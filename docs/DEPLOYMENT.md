# Deployment Guide

## 1. Supabase PostgreSQL

1. Create Supabase project.
2. Copy PostgreSQL connection string.
3. Run `database/schema.sql` in SQL editor or from backend:

```bash
DATABASE_URL='postgresql://...' npm run db:schema
```

4. Run seed:

```bash
DATABASE_URL='postgresql://...' npm run seed
```

## 2. Render Backend

1. Create new Web Service from GitHub repo.
2. Root directory: `backend`.
3. Build command: `npm install`.
4. Start command: `npm start`.
5. Add environment variables from `backend/.env.example`.
6. Set `CORS_ORIGINS` to your admin and app domains.
7. Ensure Render health check points to `/health`.

## 3. Netlify/Vercel Admin Panel

1. Import GitHub repo.
2. Root directory: `admin`.
3. Build command: `npm run build`.
4. Publish directory: `dist`.
5. Add `VITE_API_URL=https://your-render-api.onrender.com`.

## 4. Firebase Cloud Messaging

1. Create Firebase project.
2. Add Android app package ID.
3. Download `google-services.json` into mobile Android app.
4. Add backend FCM server credentials securely.
5. Implement notification route/job for appointment reminders, birthday wishes, stamp rewards, broadcasts.

## 5. Android Signed Build

1. Generate/upload keystore.
2. Set Gradle signing config.
3. Build release APK/AAB:

```bash
cd mobile/android
./gradlew assembleRelease
```

Output path:

```text
mobile/android/app/build/outputs/apk/release/app-release.apk
```

## 6. Production Security Checklist

- Use strong unique `JWT_SECRET` and `REFRESH_TOKEN_SECRET`.
- Change default admin password.
- Force HTTPS.
- Set strict CORS origins.
- Enable admin 2FA.
- Set database SSL.
- Store secrets only in hosting environment variables.
- Review logs and security audit events.
