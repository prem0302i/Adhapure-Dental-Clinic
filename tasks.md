# Tasks

Work one stage at a time. After each stage, report: what was done, files changed, missing client information, what was tested. Do not start the next stage until the owner approves.

Time estimate: 10 to 12 working days in total.

## Stage 1: Design and foundation (days 1 to 3)
- [ ] Inspect the project; confirm requirements and available assets
- [ ] Set up Next.js, TypeScript, Tailwind CSS
- [ ] Define colour, font and spacing tokens (see `design.md`)
- [ ] Create `src/lib/clinic-config.ts` with placeholders
- [ ] Build header with working mobile navigation, and footer
- [ ] Build reusable UI: Button, WhatsAppButton, Placeholder notice
- [ ] Build the homepage (hero, treatments, intro, doctor preview, gallery and testimonial placeholders, location preview, final call to action)
- [ ] Create simple "built in next stage" pages for the six other routes so no link breaks
- [ ] Run type-check and build; test layout at phone, tablet and desktop widths
- **Deliverable:** approved visual foundation and project structure

## Stage 2: Website development (days 4 to 8)
- [ ] About page
- [ ] Services and treatments page (confirmed services only)
- [ ] Doctors page with placeholder profiles
- [ ] Smile gallery with before and after layout, labels, optional lightbox, and an honest empty state
- [ ] Appointment enquiry page and form with client and server validation, spam protection, success and error states, and the "enquiry, not confirmed" notice (agree the submission method with the owner first)
- [ ] Contact and location page with Maps placeholder or real link, directions button
- [ ] WhatsApp buttons on Home, treatments, doctors, enquiry and contact
- [ ] Page-specific titles, descriptions and Open Graph tags
- **Deliverable:** complete website ready for testing

## Stage 3: Testing and launch (days 9 to 12)
- [x] Test every internal link and call to action
- [x] Test form validation, success and error paths
- [x] Test WhatsApp links and Maps
- [x] Test on mobile, tablet and desktop; check console for errors
- [x] Check accessibility basics (keyboard, focus, contrast, labels, alt text)
- [x] Check performance basics (image sizes, lazy loading)
- [x] Add sitemap and robots; add favicon placeholder
- [ ] Replace placeholders with approved client content (Blocked: pending verified client info)
- [ ] Turn off placeholder notices and remove `noindex` only when content is final (Blocked: pending client confirmation)
- [x] Prepare deployment and handover instructions; deploy only with owner approval
- **Deliverable:** tested website with complete handover guide, awaiting verified client data and launch approval

## Stage 4: Admin Content Management (Extra Scope Approved)
- [x] Snapshot Stage 3 git state (commit `877554d`)
- [x] Supabase integration with Row Level Security (RLS) & migration SQL
- [x] Admin authentication at `/admin/login` with allow-listed `admins` table verification
- [x] Protected `/admin` layout with 15-minute inactivity session timeout
- [x] Image storage helper with 5MB validation, JPEG/PNG/WebP checks, and alt-text requirement
- [x] Admin screens: Dashboard, Doctors, Treatments, Smile Gallery (with mandatory consent warning), About Content, Clinic Settings, Opening Hours
- [x] Data layer (`src/lib/content.ts`) with seamless fallback to `clinic-config.ts` when DB is empty/unreachable
- [x] Public components connected without layout or style disruption
- [x] Idempotent seed script (`supabase/seed.sql`) and setup documentation (`ADMIN.md`)
- [x] Tested auth redirects, unit validation tests, fallback integrity, and responsive layout across 375px and 1280px
- **Deliverable:** complete protected admin portal with full database schema and documentation

## Stage 5: Database Connection & Patient Enquiries
- [x] Snapshot Stage 4 git state (tag `stage4-complete`)
- [x] Environment check: detected Vite SPA, keys verified present, verified SQL migration cannot be run automatically from MCP due to token permissions
- [x] Complete database schema & RLS migrations (`supabase/schema_combined.sql` and `supabase/migrations/20261020000001_stage5_enquiries_schema.sql`)
- [x] `enquiries` table with strict check constraints, timestamps, and RLS (anon can INSERT new enquiries only; admins have full access)
- [x] Public appointment form wired to real Supabase insert with honest success/error states, honeypot, rate limiting, and zero patient data logging
- [x] Admin enquiries portal at `/admin/enquiries` with status filtering, search, detail view, confirmation status recording, and medical note warning
- [x] Dashboard updated with live new enquiry count and quick-access banner
- [x] Updated `ADMIN.md` with combined schema execution guide and enquiry management rules
- [x] Automated unit test suite run and passed (`stage5_tests.mjs`)
- [x] Browser subagent verified unauthenticated redirect to `/admin/login`, appointment form inspection, and mobile responsiveness at 375px with 0 errors
- [x] Typecheck (`npm run typecheck`) and production build (`npm run build`) passed with exit code 0
- **Deliverable:** complete database schema, enquiries pipeline, admin inbox, and security documentation

## Support
14 days of bug fixes for the agreed deliverables after launch.

## Blocked until the client supplies
Clinic name, logo, address, Maps link, phone and WhatsApp numbers, email, hours, treatments list, doctor details and photos, clinic photos, authorised gallery images, testimonials with permission, privacy wording, domain.
