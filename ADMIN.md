# Clinic Content Management & Enquiries — Administrator Guide

This document explains how to set up, operate, and maintain the protected Admin Portal at `/admin` and the Enquiries system.

---

## 1. Environment Variables Needed

In your `.env` file (copied from `.env.example`):

```env
# Public Supabase credentials (safe to expose to the browser)
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOi...

# Or Next.js convention (automatically detected by Vite):
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOi...

# Server-only Service Role Key (NEVER expose to client code or commit to Git)
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOi...
```

> **Security Rule**: The `SUPABASE_SERVICE_ROLE_KEY` must never be used in client code or prefixed with `VITE_` or `NEXT_PUBLIC_`. The `.env` file is in `.gitignore` and must never be committed.

---

## 2. How to Run Migrations & Seed Data

### Step A: Apply Complete Database Schema & Row Level Security
1. Log in to your [Supabase Dashboard](https://supabase.com/dashboard).
2. Open your project and navigate to the **SQL Editor**.
3. Open [`supabase/schema_combined.sql`](file:///d:/dental%20clinic/supabase/schema_combined.sql) from this repository.
4. Copy the entire SQL content, paste it into the Supabase SQL Editor, and click **Run**.
5. This creates:
   - All content tables: `admins`, `doctors`, `treatments`, `about_content`, `gallery_cases`, `clinic_settings`, `opening_hours`.
   - The operations table: `enquiries` with strict check constraints and RLS.
   - Storage buckets: `doctor-photos`, `gallery-cases` with public read and admin-only write policies.
   - Row Level Security (RLS) policies on every single table.

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

## 5. Security, Enquiries & Session Policies

- **Protected URLs:** Every path under `/admin` redirects unauthenticated users to `/admin/login`.
- **Inactivity Session Timeout:** If an administrator remains inactive for 15 minutes, their session automatically expires and logs them out.
- **Row Level Security (RLS):**
  - Public anonymous users can only `SELECT` published records (`is_published = true`).
  - Smile Gallery cases require **both** `is_published = true AND consent_confirmed = true` to be viewable publicly.
  - Public anonymous users can `INSERT` into `enquiries` with status `'new'` and `consent_given = true`. They cannot read, update, or delete any enquiry.
  - Only authenticated users verified in `public.admins` can `SELECT`, `UPDATE`, or `DELETE` enquiries and content tables.
- **Enquiry Management Guidelines:**
  - Status progression: `new` -> `contacted` -> `confirmed` / `cancelled`.
  - When confirming an enquiry, staff records the confirmed date and time.
  - Confirming records staff confirmation only — no automatic emails or messages are sent to the patient.
  - Internal staff notes: **Never enter medical history, diagnoses, or sensitive health data**.
- **Search Engine Exclusion:** The entire `/admin` area is marked with `noindex,nofollow` and is excluded from `sitemap.xml`.
- **Public Fallback Safety:** If Supabase is unreachable or unconfigured, the public website automatically falls back to `clinic-config.ts` without interrupting visitor access.
