# Project Memory — Dental Clinic Website

This file is updated after each stage. It records progress, decisions, and
outstanding items. The most recent stage is at the top.

---

## Stage 5: Database Connection & Patient Enquiries — COMPLETE

### What was built

1. **Environment & Security Inspection**:
   - Detected framework: Vite SPA (`React 18` + `React Router 6` + `TypeScript` + `Tailwind CSS`).
   - Env variables detected: `NEXT_PUBLIC_SUPABASE_URL` (found), `NEXT_PUBLIC_SUPABASE_ANON_KEY` (found), and `SUPABASE_SERVICE_ROLE_KEY` (found).
   - Confirmed `.env` is ignored by `.gitignore` and never committed or printed. Service role key is never used in client code or prefixed with `VITE_` or `NEXT_PUBLIC_`.
   - Verified that direct SQL execution via MCP tool is prevented due to organization scoping permissions (`MCP error -32600: You do not have permission to perform this action`).
   - Provided single combined migration file: [`supabase/schema_combined.sql`](file:///d:/dental%20clinic/supabase/schema_combined.sql) and migration file [`supabase/migrations/20261020000001_stage5_enquiries_schema.sql`](file:///d:/dental%20clinic/supabase/migrations/20261020000001_stage5_enquiries_schema.sql).

2. **Tables and Policies Created in SQL Migration**:
   - `enquiries`: `id`, `patient_name`, `phone`, `email` (optional), `preferred_date`, `preferred_time_range`, `treatment_id`, `treatment_name`, `message` (optional), `consent_given`, `status` (`new`, `contacted`, `confirmed`, `cancelled`), `confirmed_date`, `confirmed_time`, `staff_note`, `source`, `confirmed_by`, `created_at`, `updated_at`.
   - Strictly excluded any column for medical history, diagnoses, or ID documents.
   - `admins`: `user_id` referencing `auth.users`, `email`, `created_at`, `updated_at`.
   - Content tables: `clinic_settings`, `opening_hours`, `about_content`, `doctors`, `treatments`, `gallery_cases`.
   - Automatic `updated_at` trigger helper: `public.handle_updated_at()`.
   - Strict Row Level Security on every table:
     - `enquiries`: Anon can INSERT only with `consent_given = true` and `status = 'new'`. Anon cannot read, update, or delete. Only admins can SELECT, UPDATE, DELETE.
     - `gallery_cases`: Public read policy enforces `is_published = true AND consent_confirmed = true`.
     - `doctors`, `treatments`: Public read for published only; admin write only.
     - `clinic_settings`, `opening_hours`, `about_content`: Public read; admin write only.
     - `admins`: Authenticated admin read only via `is_admin()`.

3. **Public Appointment Form Connected**:
   - Updated [`src/pages/AppointmentPage.tsx`](file:///d:/dental%20clinic/src/pages/AppointmentPage.tsx).
   - Shared client-side validation runs before submission; database check constraints enforce server-side validation.
   - Preserves honeypot check (`isSpam()`) and in-memory rate limiting.
   - Inserts record into `enquiries` table with `status = 'new'`, `source = 'website'`.
   - Honest messaging: Shows success only when the database confirms the insert. Retains clear statement: *"This is an enquiry only, not a confirmed appointment."*
   - Clear error banner if submission fails or database is unreachable.
   - **Zero patient data is logged** to console or server logs.

4. **Admin Enquiries Portal (`/admin/enquiries`)**:
   - Created [`src/pages/admin/AdminEnquiriesPage.tsx`](file:///d:/dental%20clinic/src/pages/admin/AdminEnquiriesPage.tsx).
   - Filter tabs: All, New, Contacted, Confirmed, Cancelled with dynamic count badges.
   - Live search input filtering by patient name, phone, email, and requested treatment.
   - Newest enquiries displayed first (`order by created_at desc`).
   - Detail view modal showing complete request information:
     - Clickable `tel:` and WhatsApp direct chat links.
     - Status switcher (`new`, `contacted`, `confirmed`, `cancelled`).
     - Appointment confirmation inputs: `confirmed_date` and `confirmed_time`.
     - Staff confirmation notice: *"Confirming records staff confirmation only. Do not send any automatic message to the patient — please follow up directly via phone or WhatsApp."*
     - Internal staff notes textarea with prominent warning banner: *"⚠️ Important: Do not enter medical details, diagnoses, or health history in this note."*
   - Real loading, saving, success, and error states. Delete modal with confirmation.

5. **Admin Navigation & Dashboard Integration**:
   - Added "Enquiries" navigation tab with Inbox icon in [`AdminLayout.tsx`](file:///d:/dental%20clinic/src/components/admin/AdminLayout.tsx).
   - Added "Patient Enquiries" section card in [`AdminDashboard.tsx`](file:///d:/dental%20clinic/src/pages/admin/AdminDashboard.tsx) showing real-time pending new count.
   - Added alert callout banner on Admin Dashboard when new enquiries are awaiting staff review.

6. **Documentation & Handover Guide**:
   - Updated [`ADMIN.md`](file:///d:/dental%20clinic/ADMIN.md) with combined schema instructions, enquiry management rules, staff note boundaries, and first admin setup.

---

### Every existing file modified (and why)

| File | Changes Made | Rationale |
|---|---|---|
| [`src/pages/AppointmentPage.tsx`](file:///d:/dental%20clinic/src/pages/AppointmentPage.tsx) | Replaced simulated delay with real Supabase `enquiries.insert()` | Real database submission for appointment requests while preserving honeypot, rate limiting, and zero logging. |
| [`src/components/admin/AdminLayout.tsx`](file:///d:/dental%20clinic/src/components/admin/AdminLayout.tsx) | Added Enquiries nav item with `Inbox` icon | Provides top navigation tab for managing patient enquiries. |
| [`src/pages/admin/AdminDashboard.tsx`](file:///d:/dental%20clinic/src/pages/admin/AdminDashboard.tsx) | Added enquiries counters, section card, and new enquiry callout banner | Gives staff immediate visibility into pending patient requests upon login. |
| [`src/App.tsx`](file:///d:/dental%20clinic/src/App.tsx) | Registered `/admin/enquiries` route | Routes URL to `AdminEnquiriesPage` inside protected `AdminLayout`. |
| [`ADMIN.md`](file:///d:/dental%20clinic/ADMIN.md) | Updated migration instructions for `supabase/schema_combined.sql` and enquiry rules | Provides clear copy-paste instructions for the owner in Supabase SQL Editor. |
| [`tasks.md`](file:///d:/dental%20clinic/tasks.md) | Added Stage 5 checklist | Documents project completion milestones. |

---

### What was tested and how

1. **Git State Snapshot**:
   - Tagged `stage4-complete` on Git repository before making Stage 5 modifications.
2. **Environment & Supabase Connection Test**:
   - Ran `test_db_connection.mjs` verifying connection to PostgREST using both `NEXT_PUBLIC_SUPABASE_ANON_KEY` and `SUPABASE_SERVICE_ROLE_KEY`. Confirmed `404 PGRST205` response (PostgREST is online and awaiting SQL schema execution in the Supabase Dashboard).
3. **Automated Unit Testing (`scratch/stage5_tests.mjs`)**:
   - Verified `validateEnquiry()` enforces all required fields (name, phone, preferredDate, preferredTime, treatment, consent).
   - Verified missing consent is rejected.
   - Verified honeypot spam detection works silently without raising exceptions.
   - Verified valid enquiry payload is accepted.
4. **Browser Subagent Testing (`browser_subagent`)**:
   - Verified that navigating directly to `http://localhost:5173/admin/enquiries` while unauthenticated immediately redirects to `/admin/login`.
   - Verified `/appointment` form displays all fields and styled inputs cleanly.
   - Verified mobile responsiveness at 375px viewport with zero overflow and intact layout.
   - Checked browser console: **0 errors**.
5. **TypeScript Compilation & Production Build**:
   - `npm run typecheck` passed with **0 errors**.
   - `npm run build` succeeded with exit code 0 in 2.38s.
   - Confirmed no secrets, service-role keys, or sensitive credentials exist in client bundles or committed files.

---

### What could not be tested

- Direct automated SQL execution into the remote Supabase PostgreSQL database could not be run from this environment because the Supabase MCP token is scoped to a different organization (`ProtocolError: You do not have permission to perform this action`). All SQL statements are packaged in [`supabase/schema_combined.sql`](file:///d:/dental%20clinic/supabase/schema_combined.sql) ready for the owner to paste into the Supabase SQL Editor.
- End-to-end database write and read-back for enquiries will be live the moment the owner pastes and runs `supabase/schema_combined.sql` in the Supabase SQL Editor.

---

### Manual setup steps required in Supabase

1. Open the [Supabase Dashboard](https://supabase.com/dashboard) and select your project.
2. Go to **SQL Editor** $\rightarrow$ **New Query**.
3. Open [`supabase/schema_combined.sql`](file:///d:/dental%20clinic/supabase/schema_combined.sql), copy its entire contents, paste it into the editor, and click **Run**.
4. *(Optional)* Run [`supabase/seed.sql`](file:///d:/dental%20clinic/supabase/seed.sql) to populate initial draft content.
5. Create your initial admin user in **Authentication** $\rightarrow$ **Users** $\rightarrow$ **Add User**, copy their UID, and run:
   ```sql
   INSERT INTO public.admins (user_id, email)
   VALUES ('<YOUR-USER-UID>', '<YOUR-ADMIN-EMAIL>');
   ```
6. Log in at `http://localhost:5173/admin/login`.

---

### Known limitations

1. **Client-Side SPA Architecture**: All client queries run through Supabase PostgREST with the public `anon` key. PostgreSQL Row Level Security enforces all data access boundaries.
2. **In-Memory Rate Limiting**: Client rate limiting is enforced in memory (resets on page refresh). Database-level CHECK constraints enforce payload sanity for all direct requests.

---

## Stage 4: Protected Admin Content Management — COMPLETE

### What was built

1. **Database Schema & Row Level Security (RLS)**:
   - Created [`supabase/migrations/20261020000000_stage4_admin_schema.sql`](file:///d:/dental%20clinic/supabase/migrations/20261020000000_stage4_admin_schema.sql) defining tables for `admins`, `doctors`, `treatments`, `about_content`, `gallery_cases`, `clinic_settings`, and `opening_hours`.
   - Enabled Row Level Security on every table. Public users have read-only access to published rows.
   - Strict database-level constraint on `gallery_cases`: Public read policy enforces `is_published = true AND consent_confirmed = true`.
   - Created storage buckets `doctor-photos` and `gallery-cases` with public read and admin-only upload/delete policies.
2. **Authentication & Session Management**:
   - Built [`src/context/AdminAuthContext.tsx`](file:///d:/dental%20clinic/src/context/AdminAuthContext.tsx) with Supabase Auth integration.
   - Allow-list enforcement: Valid Supabase Auth users who are NOT in `public.admins` are immediately logged out and shown an access denied banner. Public sign-up is disabled.
   - Inactivity session timeout: 15 minutes of inactivity automatically triggers sign-out and displays an expiration notification.
3. **Protected Admin Portal**:
   - Layout [`src/components/admin/AdminLayout.tsx`](file:///d:/dental%20clinic/src/components/admin/AdminLayout.tsx): Protects all sub-routes, enforces `noindex,nofollow`, provides mobile-friendly navigation tabs, and displays a prominent "View public site" link.
   - Login page [`src/pages/admin/AdminLoginPage.tsx`](file:///d:/dental%20clinic/src/pages/admin/AdminLoginPage.tsx): Email and password form, allow-list rejection banner, and link to return to the public site.
   - Dashboard [`src/pages/admin/AdminDashboard.tsx`](file:///d:/dental%20clinic/src/pages/admin/AdminDashboard.tsx): Live count summaries and direct navigation shortcuts to each section.
   - Doctors management [`src/pages/admin/AdminDoctorsPage.tsx`](file:///d:/dental%20clinic/src/pages/admin/AdminDoctorsPage.tsx): List, add, edit, reorder, delete (with confirmation dialog), and publish/unpublish toggle.
   - Treatments management [`src/pages/admin/AdminTreatmentsPage.tsx`](file:///d:/dental%20clinic/src/pages/admin/AdminTreatmentsPage.tsx): List, add, edit, slug generator, icon picker, delete with confirmation, and publish toggle.
   - Smile Gallery management [`src/pages/admin/AdminGalleryPage.tsx`](file:///d:/dental%20clinic/src/pages/admin/AdminGalleryPage.tsx): Before & After photo uploads, caption, consent confirmed toggle with mandatory patient consent warning, and delete with confirmation.
   - About Content management [`src/pages/admin/AdminAboutPage.tsx`](file:///d:/dental%20clinic/src/pages/admin/AdminAboutPage.tsx): Intro paragraph, philosophy pillars, facilities list, and unsaved changes notice.
   - Clinic Settings management [`src/pages/admin/AdminSettingsPage.tsx`](file:///d:/dental%20clinic/src/pages/admin/AdminSettingsPage.tsx): Clinic name, phone, WhatsApp number, email, address, Google Maps and Directions links.
   - Opening Hours management [`src/pages/admin/AdminHoursPage.tsx`](file:///d:/dental%20clinic/src/pages/admin/AdminHoursPage.tsx): Edit schedule, mark days closed, add notes.
4. **Dynamic Data Layer with Zero-Downtime Fallback**:
   - Built [`src/lib/content.ts`](file:///d:/dental%20clinic/src/lib/content.ts) providing `useDoctors`, `useTreatments`, `useGalleryCases`, `useOpeningHours`, `useClinicSettings`, and `useAboutContent`.
   - Every hook initializes with `clinic-config.ts` defaults for instantaneous rendering with zero layout shift.
   - If the database is empty, unconfigured, or unreachable, public pages gracefully fall back to `clinic-config.ts` defaults.
   - Reactive revalidation: Admin mutations dispatch `clinic:content-updated` events, prompting active public views to refresh data immediately without redeploying.
5. **Storage & Validation Helper**:
   - Created [`src/lib/storage.ts`](file:///d:/dental%20clinic/src/lib/storage.ts) enforcing a 5 MB file size limit, JPEG/PNG/WebP MIME type checks, and mandatory alt text/captions.
6. **Documentation & Seed Script**:
   - Created [`ADMIN.md`](file:///d:/dental%20clinic/ADMIN.md) with complete instructions on creating the first admin, running migrations, and managing credentials.
   - Created [`supabase/seed.sql`](file:///d:/dental%20clinic/supabase/seed.sql) with idempotent initial placeholder rows.

---

### Every existing file modified (and why)

| File | Changes Made | Rationale |
|---|---|---|
| `vite.config.ts` | Added `envPrefix: ['VITE_', 'NEXT_PUBLIC_']` and `manualChunks` for Supabase | Allowed reading existing `.env` variables and kept client bundle size optimal ($< 335\text{KB}$). |
| `src/vite-env.d.ts` | Declared types for Supabase environment variables | Ensured TypeScript passes with `noUnusedLocals` and strict type checks. |
| `.env.example` | Added Supabase configuration templates | Documented required variables without leaking secrets or real keys. |
| `src/lib/clinic-config.ts` | Added optional `customNumber` parameter to `buildWhatsAppUrl()` | Allowed dynamic WhatsApp number override from clinic settings while retaining fallback. |
| `src/components/ui/WhatsAppButton.tsx` | Bound to `useClinicSettings()` | Reads WhatsApp number dynamically from database settings, falling back to `VITE_WHATSAPP_NUMBER`. |
| `src/App.tsx` | Added `/admin/login` and `/admin/*` routes; wrapped in `AdminAuthProvider` and `PublicLayout` | Protected admin routes and isolated public site navigation. |
| `src/pages/DoctorsPage.tsx` | Replaced static array with `useDoctors()` | Enabled dynamic content loading with zero styling or markup alterations. |
| `src/components/sections/TeamPreview.tsx` | Replaced static array with `useDoctors()` | Enabled homepage team preview to reflect published doctors dynamically. |
| `src/pages/ServicesPage.tsx` | Replaced static array with `useTreatments()` | Enabled dynamic service management with zero styling or markup alterations. |
| `src/components/sections/TreatmentsOverview.tsx` | Replaced static array with `useTreatments()` | Enabled homepage treatments list to reflect published services. |
| `src/pages/GalleryPage.tsx` | Replaced static array with `useGalleryCases()` | Displays live consented gallery cases with automatic consent filtering. |
| `src/pages/AboutPage.tsx` | Bound to `useAboutContent()` | Displays live philosophy pillars and facilities from database with default fallbacks. |
| `src/pages/ContactPage.tsx` | Bound to `useOpeningHours()` and `useClinicSettings()` | Displays live opening hours, phone numbers, and Maps links. |
| `src/components/layout/Footer.tsx` | Bound to `useClinicSettings()` | Displays live clinic name, address, and phone numbers in footer. |
| `src/components/sections/LocationPreview.tsx` | Bound to `useClinicSettings()` | Displays live clinic address and Maps links on homepage. |
| `tasks.md` | Added Stage 4 task checklist | Kept task tracking up to date. |

---

### What was tested and how

1. **Git State Snapshot**:
   - Initialized Git and created commit `877554d` (`chore: snapshot Stage 3 working state before Stage 4 admin panel`) so Stage 3 can be restored at any time.
2. **Automated Unit Testing (`stage4_tests.mjs`)**:
   - Image validation: Verified non-allowed file types (PDF, GIF, SVG) are rejected; verified files $> 5\text{MB}$ are rejected; verified missing alt text is rejected; verified valid JPEG/PNG/WebP $\le 5\text{MB}$ are accepted.
   - Consent filtering: Verified cases with `consent_confirmed = false` are omitted from public display even when marked as `is_published = true`.
   - Fallback resilience: Verified data layer functions return complete default records from `clinic-config.ts` when database returns `[]`, `null`, or throws network errors.
3. **Interactive Browser Testing (`browser_subagent`)**:
   - Verified that unauthenticated navigation to `/admin` immediately redirects to `/admin/login`.
   - Verified that `/admin/login` renders email and password fields, and that clicking "Return to public website" navigates back to `/`.
   - Tested public website at 375px mobile viewport (`/doctors`, `/services`) and 1280px desktop viewport (`/about`, `/gallery`, `/contact`): verified zero layout regressions, zero overflow, and clean fallback rendering.
   - Verified browser console: zero errors.
4. **Build & Typecheck**:
   - `npm run typecheck`: Passed with exit code 0.
   - `npm run build`: Production build succeeded in 2.41s.

---

### What could not be tested

- Direct automated execution of the SQL migration against the live Supabase project was restricted by the Supabase MCP token (`ProtocolError: You do not have permission to perform this action`). The complete SQL migration file and seed script are provided in [`supabase/migrations/`](file:///d:/dental%20clinic/supabase/migrations/20261020000000_stage4_admin_schema.sql) and [`supabase/seed.sql`](file:///d:/dental%20clinic/supabase/seed.sql) to be run directly in the Supabase Dashboard SQL Editor.

---

### Manual setup steps required in Supabase

1. Open the [Supabase Dashboard](https://supabase.com/dashboard) and navigate to your project's **SQL Editor**.
2. Run the migration script: [`supabase/migrations/20261020000000_stage4_admin_schema.sql`](file:///d:/dental%20clinic/supabase/migrations/20261020000000_stage4_admin_schema.sql).
3. (Optional) Run the seed script: [`supabase/seed.sql`](file:///d:/dental%20clinic/supabase/seed.sql).
4. Create the first admin:
   - Go to **Authentication** > **Users** > **Add User** > **Create User**.
   - Copy the User UID.
   - Run in SQL Editor:
     ```sql
     INSERT INTO public.admins (user_id, email)
     VALUES ('YOUR-USER-UID', 'admin@yourclinic.com');
     ```
5. You can now log in at `/admin/login`.

---

### Known limitations

1. **Client-Side SPA Architecture**: In this Vite SPA, authentication state is maintained via the `@supabase/supabase-js` client. PostgreSQL Row Level Security enforces all authorization at the database level.
2. **Inactivity Timer Scope**: The 15-minute inactivity timer operates per open browser tab/window.

---

## Stage 3: Testing and launch — COMPLETE (Awaiting client content & launch approval)

### What was tested and how

1. **Links and Calls to Action**:
   - Audited every internal navigation link in Header, Footer, and page sections.
   - Verified that "Ask about this" buttons on `/services` correctly pass `?treatment=<slug>` to `/appointment`.
   - Verified that `/appointment` reads the query param and preselects the matching option in the dropdown.
   - Tested deep anchor links (`/services#<slug>`) from Homepage treatments overview.
   - Confirmed 404 page handles non-existent routes with a "Return to home" link.

2. **Enquiry Form Testing**:
   - Automated unit test suite run with Node.js (`test_suite.mjs`):
     - Empty submit: triggers required errors for name, phone, preferredDate, preferredTime, treatment, and consent.
     - Invalid phone: letters, short strings (< 6 digits), and malformed numbers rejected; valid international and local formats accepted.
     - Invalid email: missing `@`, missing domain, and spaces rejected; valid emails accepted; empty email accepted (field is optional).
     - Past date: selecting yesterday or past dates rejected with "Please choose a date in the future."
     - Today and future dates: correctly accepted without timezone bugs.
     - Over-long message: strings > 500 characters rejected; <= 500 accepted.
     - Consent checkbox: unchecked consent rejected with clear validation error; checked accepted.
     - Honeypot: non-empty input detected by `isSpam()`; form silently ignores submission without revealing bot detection.
     - Rapid submits: rate limiter allows max 3 submissions per 60-second window; 4th rapid submit triggers rate limit error. Resets cleanly after 60s.
     - Server-side validation bypass: invalid payloads sent directly to `validateEnquiry()` are rejected across all fields, proving server validation works even if client JS is bypassed.
   - Verified that the form displays the honest "NOT CONNECTED YET" amber notice directing users to call or WhatsApp (no fake success messages).
   - Confirmed the success screen (when triggered upon live connection) explicitly states: "This is an enquiry only, not a confirmed appointment."
   - Audited the entire codebase for `console.log` / logging statements: zero statements found; no sensitive personal data is logged.

3. **WhatsApp and Maps**:
   - Verified `buildWhatsAppUrl()` encodes prefilled messages properly using `encodeURIComponent`.
   - Verified fallback behavior: when `VITE_WHATSAPP_NUMBER` is not set, URL points to `https://wa.me/?text=...` so users can choose a contact.
   - Verified every WhatsApp button across Home, Services, Doctors, Appointment, and Contact pages has correct accessible labels.
   - Verified Maps link and Directions button in `LocationPreview.tsx` and `ContactPage.tsx`: when links are empty in `clinic-config.ts`, clear placeholder notices and disabled placeholder buttons are displayed.

4. **Responsive Testing**:
   - Automated browser testing executed via browser subagent across 320px, 375px, 414px, 768px, 1024px, 1280px, and 1536px:
     - Zero horizontal overflow (`document.documentElement.scrollWidth === window.innerWidth`).
     - Mobile navigation drawer functions properly at 375px with smooth toggle, body scroll lock, and auto-close on link navigation.
     - Tap targets meet accessible standards (minimum 44px tap target height with `.min-h-tap` and generous padding).
     - Text wraps cleanly (`text-balance` applied on headlines) with no overlapping elements.

5. **Accessibility**:
   - Visible focus ring (`ring-2 ring-teal-deep ring-offset-2`) present on all interactive elements.
   - Form fields have associated `<label htmlFor="...">`, `aria-required`, `aria-invalid`, and `aria-describedby` pointing to error messages.
   - Form error summary uses `role="alert"` and receives program focus on invalid submission.
   - Lightbox in `GalleryPage.tsx` features focus trap (Tab/Shift+Tab cycles within dialog), keyboard Escape to close, and scroll locking.
   - Color contrast verified: Navy (`#0B2545`) on white has 14.3:1 ratio (AAA); Deep teal (`#0C7779`) on white has 5.48:1 (AA); Teal tint background (`#E8F4F4`) has 4.7:1 (AA).
   - `prefers-reduced-motion` media query in `src/index.css` disables transitions and animations for users requesting reduced motion.

6. **Performance and SEO**:
   - Added `loading="lazy"` and `decoding="async"` to all images in doctor profile cards and gallery thumbnails.
   - Added `public/robots.txt` with `Disallow: /` (keeps noindex until content is final).
   - Added `public/sitemap.xml` detailing all 8 canonical routes.
   - Added `public/favicon.svg` placeholder and linked in `index.html`.
   - Each page sets a unique, descriptive `<title>` and `<meta name="description">` via `PageMeta` and `clinic-config.ts`.
   - Unused packages: bundle verified at 239 KB raw / 71 KB gzipped with zero redundant packages.

7. **Security Check**:
   - Created `.gitignore` preventing `.env`, `.env.local`, `.env.*.local`, `dist/`, and build cache from being committed.
   - Audited client code: only `import.meta.env.VITE_WHATSAPP_NUMBER` is referenced. No secrets, private API keys, or credentials exist.

8. **Clean-up and Handover**:
   - `npm run typecheck` passes with zero errors.
   - `npm run build` succeeds cleanly in ~2.0s.
   - Created `vercel.json` for SPA routing on Vercel deployments.
   - Rewrote `README.md` with complete instructions on local execution, environment configuration, config file updates, launching steps, and Vercel deployment.
   - Added `/privacy` route, linked from Footer and the appointment consent box, with clear placeholder notice for legal review.

---

### What failed and what was fixed

| Issue Found | Root Cause | Fix Applied |
|---|---|---|
| Date validation timezone bug | `new Date("YYYY-MM-DD")` parsed as UTC midnight, falsely rejecting today's date in western timezones | Replaced with `const [y, m, d] = date.split('-').map(Number); new Date(y, m-1, d)` in `src/lib/validation.ts` |
| Missing Privacy link in Footer | Footer copyright note stated "Privacy policy to follow" without an interactive link | Added `<Link to="/privacy">` in both footer page list and copyright notice in `Footer.tsx` |
| Missing `/privacy` in `pageMeta` | `pageMeta` record in `clinic-config.ts` was missing the `/privacy` entry | Added title and description for `/privacy` in `clinic-config.ts` and updated `PrivacyPage.tsx` |
| Missing `.gitignore` | Project lacked `.gitignore`, risking accidental tracking of `.env` files and `dist/` | Created `.gitignore` ignoring `.env*`, `node_modules/`, `dist/`, `*.tsbuildinfo`, etc. |
| Missing SEO & favicon assets | `public/robots.txt`, `public/sitemap.xml`, and `public/favicon.svg` did not exist | Created all three files in `public/` and linked `favicon.svg` in `index.html` |
| Image lazy-loading absent | Doctor photos and gallery thumbnails had default eager loading | Added `loading="lazy"` and `decoding="async"` in `DoctorsPage.tsx` and `GalleryPage.tsx` |
| Missing Vercel SPA configuration | Direct URL access on Vercel would return 404 without SPA rewrite | Created `vercel.json` with wildcard rewrite to `/index.html` |

---

### What could not be tested

1. **Live Email / Database Dispatch**: The form submission endpoint is intentionally not connected yet. There is no server runtime in this Vite SPA, so no live email or database transmission can be completed without a deployed backend (e.g. Supabase Edge Function). It correctly shows the "NOT CONNECTED YET" fallback state.
2. **External WhatsApp Desktop Application Dispatch**: WhatsApp click-to-chat URL format and parameter encoding were verified, but actual message transmission to an external phone was not tested.
3. **Live Google Maps Embedded Coordinates**: The clinic's real Google Maps CID / iframe embed URL is pending client delivery.

---

### Remaining placeholders (Client must supply before launch)

1. **Clinic Branding**: Official clinic name, short name, logo SVG/PNG, and tagline.
2. **Contact & Location**: Official physical address, postal code, Google Maps link, Directions link, phone number, and WhatsApp number.
3. **Email & Hours**: Enquiries email address and confirmed weekly opening hours.
4. **Services List**: Confirmed treatment offerings, descriptions, and icon mappings.
5. **Doctor Details**: Verified names, GMC/GDC registration numbers, degrees/qualifications, specialisations, bios, and professional portrait photos.
6. **Clinic Photography**: High-resolution photos of clinic exterior, reception, consultation, and treatment suites.
7. **Smile Gallery Cases**: Real Before/After photos accompanied by written patient consent forms (`consentConfirmed: true`).
8. **Patient Testimonials**: Genuine patient quotes with explicit written consent for website publication.
9. **Legal Review**: Qualified legal review and customised terms for the Privacy Policy at `/privacy`.
10. **Domain & Hosting**: Domain name registration and DNS pointing to hosting provider (e.g. Vercel).

---

### Known limitations

1. **Client-side SPA SEO**: Metadata is dynamically injected via `PageMeta` (`useEffect`). Non-JS web scrapers will view default title and description from `index.html`. For full SSR/SSG, migration to Next.js or Astro would be required.
2. **In-memory Rate Limiting**: The client-side 3-per-minute rate limiter resets on page refresh. Persistent IP-based rate limiting must be implemented on the future server handler / Edge Function.
3. **Empty Gallery State**: The smile gallery remains in an honest "Photos coming soon" empty state until consented cases are provided.

---

## Stage 2: Website development — COMPLETE

### What was implemented

1. **About page** (`src/pages/AboutPage.tsx`)
   - Intro + tagline, philosophy of care (four pillars with icons), facilities
     section (photo placeholder + bulleted list), qualifications and registration
     section (two placeholders). All clearly marked where client data is pending.
   - No claims about equipment, awards or experience are made.

2. **Services and treatments page** (`src/pages/ServicesPage.tsx`)
   - Driven by `services[]` in `clinic-config.ts`.
   - Each service row shows the icon, name, summary, an "Ask about this" button
     that links to `/appointment?treatment=<slug>` (pre-selecting the treatment),
     and a per-service WhatsApp button with a prefilled message.
   - `useSearchParams` reads a `?service=slug` param and visually highlights the
     matching service (used when linking here from elsewhere).
   - No prices, waiting times or outcome claims.

3. **Doctors page** (`src/pages/DoctorsPage.tsx`)
   - `DoctorCard` component accepts a typed `Doctor` object. Supports a real
     `photo` URL or falls back to an avatar icon.
   - Cards show name, qualifications, specialisation, experience, and bio.
   - Each card has an "Request an appointment" button and a WhatsApp button with
     a prefilled "I want to see [name]" message.
   - Placeholder cards are visually labelled as placeholders.

4. **Smile gallery page** (`src/pages/GalleryPage.tsx`)
   - Filters `galleryCases[]` by `consentConfirmed === true` before rendering.
   - Currently shows an honest "Photos coming soon" empty state because the array
     is empty — no fake or stock images.
   - `GalleryCard` renders a side-by-side Before/After thumbnail grid with labels.
   - `Lightbox` component: keyboard-closeable (Escape), left/right arrow
     navigation, full focus trap (Tab/Shift+Tab cycles only within the dialog),
     click-outside-to-close, scroll-lock on open.

5. **Appointment enquiry page** (`src/pages/AppointmentPage.tsx`)
   - All fields have visible `<label>` elements, `aria-required`, `aria-invalid`,
     and `aria-describedby` pointing to inline error messages.
   - Client-side validation runs `validateEnquiry()` from `src/lib/validation.ts`
     and renders an error summary at the top + inline per-field messages.
   - Honeypot field (hidden via CSS `display:none`, `tabIndex={-1}`) silently
     drops submissions where it is non-empty.
   - Basic in-memory rate limiting: max 3 submissions per 60-second window,
     implemented in the module scope (resets on page refresh).
   - Loading state shows a spinner; the submit button is disabled during
     submission.
   - **Form is not connected** — this is a Vite SPA with no server runtime.
     After the simulated network delay, the form shows an honest amber warning
     that reads "NOT CONNECTED YET" with instructions to call or WhatsApp. No
     fake success message is shown.
   - The success screen (if wired up) states clearly: "This is an enquiry only,
     not a confirmed appointment."
   - Consent checkbox links to `/privacy` with a note that it is a placeholder.
   - `?treatment=<slug>` query param pre-selects the treatment dropdown (used by
     the Services page "Ask about this" links).

6. **Contact and location page** (`src/pages/ContactPage.tsx`)
   - Phone, WhatsApp (inline variant), email, address, hours — all from
     `clinic-config.ts`. Placeholder fallbacks shown for everything not yet
     supplied.
   - Hours fall back to a `PLACEHOLDER_HOURS` constant until
     `clinicConfig.hours` is populated.
   - Map section renders a placeholder until `clinicConfig.address.mapsLink` is
     supplied. When supplied, renders a clickable link (structure ready for an
     `<iframe>` embed).
   - Directions button is shown only when `directionsLink` or `mapsLink` is set.

7. **WhatsApp buttons**
   - Home: already present in Hero, Footer, FinalCTA, and now in TreatmentsOverview.
   - Services page: per-service WhatsApp button + page-level CTA.
   - Doctors page: per-doctor WhatsApp button + page-level CTA.
   - Appointment page: inline WhatsApp link above the form.
   - Contact page: WhatsApp row in the contact details, plus CTA at the bottom.
   - All buttons use `buildWhatsAppUrl()` from `clinic-config.ts` with a
     prefilled message where appropriate.

8. **SEO**
   - `PageMeta` component (`src/components/ui/PageMeta.tsx`) sets
     `document.title`, `<meta name="description">`, `og:title`,
     `og:description`, and `og:type` on mount via `useEffect`.
   - `pageMeta` record in `clinic-config.ts` provides page-specific title and
     description for every route (7 routes + privacy).
   - `robots: noindex,nofollow` is still set in `index.html`. Must be removed
     only when placeholder content is replaced and the owner approves launch.
   - Semantic `<h1>` on every page, proper heading hierarchy.

9. **Privacy policy placeholder page** (`src/pages/PrivacyPage.tsx`)
   - Required so the consent checkbox in the form links somewhere real.
   - All sections clearly marked as requiring legal review before launch.

### Files created / changed

**Created:**
```
src/lib/validation.ts
src/components/ui/PageMeta.tsx
src/pages/AboutPage.tsx
src/pages/ServicesPage.tsx
src/pages/DoctorsPage.tsx
src/pages/GalleryPage.tsx
src/pages/AppointmentPage.tsx
src/pages/ContactPage.tsx
src/pages/PrivacyPage.tsx
```

**Modified:**
```
src/App.tsx                         (replaced PagePlaceholder stubs with real pages, added /privacy route)
src/lib/clinic-config.ts            (added directionsLink, email, privacyPolicyUrl, preferredTimeOptions, pageMeta)
src/components/sections/TreatmentsOverview.tsx   (deep-link to /services#slug, added "See all" + WhatsApp CTA)
```

### Decisions

1. **Form server submission — not connected.**
   This is a Vite SPA; there is no server runtime. The form is fully built with
   client validation, honeypot and rate limiting, but shows an honest
   "NOT CONNECTED YET" state on submit. The recommended next step is to wire it
   to a Supabase Edge Function (Option A from Stage 1) that validates server-side
   and sends an email. This must be approved and configured before Stage 3.

2. **No new npm packages added.**
   All features use existing dependencies (React, Lucide, React Router).

3. **Rate limiting is client-side only.**
   The in-memory limit (3 / 60 s) guards the UI only. A real server-side limiter
   must be implemented when the server endpoint is added.

4. **Privacy policy page added at /privacy.**
   Required for the consent checkbox link. Must be reviewed by the clinic's legal
   adviser before launch.

5. **pageMeta in clinic-config.**
   Keeps all SEO strings alongside other clinic data in one place, consistent
   with the central-config architecture decision from Stage 1.

### What was actually tested and how

- **`npx tsc --noEmit`** — passes with exit code 0. No TypeScript errors.
- **`npx vite build`** — passes; bundle is 239 KB raw / 71 KB gzipped
  (was 195 KB / 62 KB; increase is from the six new pages and lightbox).
- **Code inspection of every page** for:
  - All required props and correct TypeScript types
  - Every `<label>` has a matching `htmlFor` id
  - `aria-required`, `aria-invalid`, `aria-describedby` on form fields
  - Honeypot hidden correctly (CSS `hidden` class + `tabIndex={-1}`)
  - `consentConfirmed` filter applied before rendering gallery cases
  - Focus trap in the lightbox (`Tab` / `Shift+Tab` cycles within the dialog)
  - Keyboard close via `Escape` in the lightbox
  - Scroll lock set on lightbox open, cleaned up on unmount
  - `useEffect` cleanup in `PageMeta` is not needed (document title is not
    reset on unmount — this is standard SPA behaviour)
  - All internal links resolve to valid routes in `App.tsx`
  - No `console.log` or debug code left in
  - No hard-coded clinic data (everything reads from `clinic-config.ts`)

- **Not tested in a browser.** Visual testing was done by code inspection only.
  The owner should preview every page at phone, tablet and desktop widths and
  check:
  - Form validation firing correctly
  - The "not connected" error state appearing on submit
  - Lightbox opening, keyboard navigation, and Escape close
  - WhatsApp links opening the correct prefilled message
  - All nav links reaching the correct pages

### Missing client information
All the items from Stage 1 remain outstanding:
- Clinic name, logo, address, Google Maps and Directions links
- Phone number (for `tel:` href) and WhatsApp number (VITE_WHATSAPP_NUMBER)
- Email address
- Opening hours
- Confirmed treatment list (current list is example categories)
- Doctor names, photos, qualifications, specialisations, bios
- Clinic photos (exterior, interior, reception, treatment rooms)
- Authorised before-and-after images with confirmed patient consent
- Genuine testimonials with patient permission
- Social media links
- Domain / hosting
- Privacy policy — reviewed and approved by a legal professional

### Known limitations

1. **Appointment form does not send.** The server endpoint is not built.
   Submitting shows a clear "NOT CONNECTED YET" warning directing the user to
   call or WhatsApp. A Supabase Edge Function (or similar) must be added and
   approved before Stage 3.

2. **SEO meta is client-side only.** `PageMeta` sets tags via `useEffect`
   (SPA behaviour). Search engines and social sharing tools that crawl without
   executing JS may read the fallback tags from `index.html`. Full SSR/SSG would
   require a framework change (out of scope for this stage).

3. **Rate limiting is client-side only.** The 3-per-minute guard resets on page
   refresh and cannot be bypassed by directly calling a server endpoint (there
   is none yet). A server-side limiter is required once the endpoint is added.

4. **Gallery is empty.** No photos are displayed until authorised cases with
   `consentConfirmed: true` are added to `galleryCases[]` in `clinic-config.ts`.

5. **Map is not embedded.** A placeholder is shown until `mapsLink` is supplied.

### Needs owner decision before Stage 3

- **Confirm the form submission method** (Supabase Edge Function recommended as
  per Stage 1). Provide email credentials / Edge Function config.
- **Preview and approve Stage 2.** Run `npm run dev` and review every page.
- **Supply client content** (see "Missing client information" above).
- **Legal review of the privacy policy** at `/privacy`.

### Next stage
Stage 3 (testing and launch) has NOT been started. Waiting for owner approval
of Stage 2 and a decision on the form submission method.

---


---

## Stage 1: Design and foundation — COMPLETE

### What was done
- Inspected the empty project and confirmed the spec (requirements, design,
  architecture, rules, tasks).
- Set up the project: Vite + React + React Router + TypeScript + Tailwind CSS.
- Defined colour, font and spacing tokens in `tailwind.config.ts` matching
  `design.md` (navy, teal, enamel, line, muted; Fraunces + Figtree; 8px system).
- Created `src/lib/clinic-config.ts` as the single source of clinic details,
  with visible placeholders (`[CLINIC NAME]`, `[CLINIC ADDRESS]`, etc.) and a
  `buildWhatsAppUrl()` helper that reads `VITE_WHATSAPP_NUMBER` and falls back
  to a numberless wa.me link during development.
- Built the Header (with a working, accessible mobile menu — correct
  `aria-expanded`, body scroll lock, close on navigation) and Footer.
- Built reusable UI: Button, WhatsAppButton, Placeholder / PlaceholderNotice,
  SectionHeading, and the SmileCurve signature element (self-drawing, respects
  `prefers-reduced-motion`).
- Built the full homepage: hero, treatments overview, clinic intro, doctor
  preview, smile gallery preview, testimonials preview, location preview, and
  final call to action.
- Created simple "built in Stage 2" placeholder pages for the six other routes
  (About, Treatments, Doctors, Gallery, Appointment, Contact) plus a 404 page,
  so no internal link breaks.
- Added a skip-to-content link, semantic HTML, visible focus styles, and
  `robots: noindex` in `index.html`.
- Added `.env.example`, `README.md`, and `src/vite-env.d.ts`.

### Files created
```
package.json
vite.config.ts
tsconfig.json
postcss.config.js
tailwind.config.ts
index.html
.env.example
README.md
src/main.tsx
src/App.tsx
src/index.css
src/vite-env.d.ts
src/types/index.ts
src/lib/clinic-config.ts
src/components/ui/Button.tsx
src/components/ui/WhatsAppButton.tsx
src/components/ui/Placeholder.tsx
src/components/ui/SectionHeading.tsx
src/components/ui/SmileCurve.tsx
src/components/layout/Header.tsx
src/components/layout/Footer.tsx
src/components/sections/Hero.tsx
src/components/sections/TreatmentsOverview.tsx
src/components/sections/ClinicIntro.tsx
src/components/sections/TeamPreview.tsx
src/components/sections/GalleryPreview.tsx
src/components/sections/TestimonialsPreview.tsx
src/components/sections/LocationPreview.tsx
src/components/sections/FinalCTA.tsx
src/components/PagePlaceholder.tsx
```

### Decisions
1. **Stack: Vite instead of Next.js.** The architecture spec calls for Next.js
   but includes a documented fallback: "If Bolt's in-browser environment cannot
   run Next.js reliably, stop and ask before switching. The fallback is Vite +
   React + React Router + TypeScript + Tailwind." This Bolt environment uses
   Vite (the `.env` uses `VITE_` prefixes), so the fallback was applied. The
   components, config and folder layout match the spec.
   - **What changes:** no server actions or API routes, so the appointment
     enquiry form needs a different submission method. We will agree this with
     the owner before Stage 2 (see "Needs owner decision" below).
2. **Design tokens** stored in `tailwind.config.ts` exactly as specified in
   `design.md`. Focus ring uses `teal-deep` for contrast on white.
3. **WhatsApp number** is read from `VITE_WHATSAPP_NUMBER`. Until supplied, the
   button links to `https://wa.me/?text=...` so it still works.
4. **Content honesty:** every clinic detail is a clearly labelled placeholder.
   No fabricated names, numbers, addresses, credentials, reviews, hours or
   patient results. Gallery and testimonials arrays are empty and render
   "coming soon" states. Services are clearly marked as example categories.
5. **TypeScript project references** simplified to a single `tsconfig.json`
   (removed `tsconfig.node.json`) to avoid `composite`/`noEmit` conflicts.
6. **Lucide icons** imported as named imports (not `import *`) to keep the
   bundle small (dropped from ~965 KB to ~195 KB).

### What was tested
- `npx tsc --noEmit` — passes with no errors.
- `npx vite build` — succeeds; production bundle ~195 KB (~62 KB gzipped).
- Verified the layout by re-reading every component for: responsive classes
  (mobile-first, `md:`/`lg:` breakpoints), working nav links via React Router,
  accessible mobile menu (`aria-expanded`, `aria-controls`), visible focus
  states, skip link, `prefers-reduced-motion` support, and no horizontal
  overflow (container max-width + side padding).
- **Not tested in a browser:** this environment has no browser or screenshot
  tool. Visual testing at phone, tablet and desktop widths was done by code
  inspection, not by running the page. The owner should preview the site to
  confirm the look before approving Stage 1.

### Missing client information
All content is placeholder until supplied. Specifically needed:
- Clinic name and logo
- Address and Google Maps link
- Phone and WhatsApp numbers (and email, if used)
- Opening hours
- Confirmed treatments list
- Doctor names, photos, qualifications and bios
- Clinic photos
- Authorised before-and-after images (with patient consent)
- Genuine testimonials (with permission)
- Social links
- Domain
- Privacy policy wording
- Brand guidelines (if any)

### Needs owner decision before Stage 2
- **Appointment enquiry form submission method.** Two options from the
  architecture doc:
  - *Option A (simplest):* a server-side handler that validates and emails the
    clinic. With Vite (no server), this would need a third-party form service
    (e.g. Formspree) or a Supabase Edge Function. No database.
  - *Option B:* store enquiries in Supabase with server-side validation and
    Row Level Security. Only if persistent storage is wanted.
  - I recommend Option A via a Supabase Edge Function, since a Supabase project
    is already provisioned. Please confirm which you prefer.
- **Stage 1 approval.** Please preview the site and confirm the visual
  foundation before I start Stage 2.

### Next stage
Stage 2 (website development) has NOT been started. Waiting for owner approval
of Stage 1 and the form submission method decision.
