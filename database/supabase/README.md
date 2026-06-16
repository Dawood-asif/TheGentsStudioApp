# Supabase SQL Deployment

Use these files in Supabase SQL Editor in this order:

1. `../schema.sql`
2. `../seed.sql`

Or from backend terminal with `DATABASE_URL` set:

```bash
cd backend
npm run db:schema
npm run seed
```

If using the SQL Editor manually:

- Open Supabase project.
- Go to SQL Editor.
- Paste `database/schema.sql` and run.
- Paste `database/seed.sql` and run.

Default seeded admin:

```text
admin@thegentsstudio.com
Admin@2024
```

Change password immediately after deployment.
