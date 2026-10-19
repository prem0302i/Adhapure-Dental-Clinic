# Clinic Content Management — Administrator Guide

This document explains how to set up, operate, and maintain the protected Admin Portal at `/admin`.

---

## 1. Environment Variables Needed

In your `.env` file (copied from `.env.example`):

```env
# Public Supabase credentials (safe to expose to the browser)
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOi...

# Or Next.js convention (automatically detected by Vite):
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGci...

# Server-only Service Role Key (NEVER expose to client code or commit to Git)
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOi...
```

---

## 2. How to Run Migrations & Seed Data

### Step A: Apply Database Schema & Row Level Security
1. Log in to your [Supabase Dashboard](https://supabase.com/dashboard).
2. Open your project and navigate to the **SQL Editor**.
3. Open [`supabase/migrations/20261020000000_stage4_admin_schema.sql`](file:///d:/dental%20clinic/supabase/migrations/20261020000000_stage4_admin_schema.sql) from this repository.
4. Copy the entire SQL content, paste it into the Supabase SQL Editor, and click **Run**.
5. This creates all tables (`admins`, `doctors`, `treatments`, `about_content`, `gallery_cases`, `clinic_settings`, `opening_hours`), storage buckets (`doctor-photos`, `gallery-cases`), and configures PostgreSQL Row Level Security (RLS).

### Step B: (Optional) Load Initial Placeholder Seed Data
1. In the Supabase **SQL Editor**, open [`supabase/seed.sql`](file:///d:/dental%20clinic/supabase/seed.sql).
2. Paste and click **Run**.
3. This safely populates initial placeholder records so the admin screens have draft rows to edit immediately. This script is idempotent (`ON CONFLICT DO NOTHING`).

---

## 3. How to Create the First Administrator

Because public sign-up is disabled, administrator accounts must be created in Supabase Auth and registered in the `admins` table.

1. In the Supabase Dashboard, navigate to **Authentication** > **Users**.
2. Click **Add User** > **Create User**.
3. Enter the administrator's **Email** and a secure **Password**. Ensure "Auto Confirm User" is enabled.
4. Copy the generated user's **User UID** (e.g. `a1b2c3d4-e5f6-7890-abcd-ef1234567890`).
5. Open the **SQL Editor** and run:
   ```sql
   INSERT INTO public.admins (user_id, email)
   VALUES ('YOUR-USER-UID-HERE', 'admin@yourclinic.com');
   ```
6. The administrator can now log in at `/admin/login`.

---

## 4. How to Add or Remove an Administrator

### Adding an Admin
1. Create the user in Supabase Auth as described above.
2. Insert their UID into `public.admins`:
   ```sql
   INSERT INTO public.admins (user_id, email)
   VALUES ('NEW-USER-UID', 'newadmin@yourclinic.com');
   ```

### Removing an Admin
Run the following SQL in the Supabase SQL Editor:
```sql
DELETE FROM public.admins WHERE email = 'formeradmin@yourclinic.com';
```
*Note: Once removed from the `admins` table, any login attempts with that account will immediately be rejected by both the application and PostgreSQL Row Level Security.*

---

## 5. Security & Session Policies

- **Protected URLs:** Every path under `/admin` redirects unauthenticated users to `/admin/login`.
- **Inactivity Session Timeout:** If an administrator remains inactive for 15 minutes, their session automatically expires and logs them out.
- **Row Level Security (RLS):**
  - Public anonymous users can only `SELECT` published records (`is_published = true`).
  - Smile Gallery cases require **both** `is_published = true AND consent_confirmed = true` to be viewable publicly.
  - Mutations (`INSERT`, `UPDATE`, `DELETE`) are strictly forbidden unless the caller is verified in the `admins` table.
- **Search Engine Exclusion:** The entire `/admin` area is marked with `noindex,nofollow` and is excluded from `sitemap.xml`.
- **Public Fallback Safety:** If Supabase is unreachable or unconfigured, the public website automatically falls back to `clinic-config.ts` without interrupting visitor access.
