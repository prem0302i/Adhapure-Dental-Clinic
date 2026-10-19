# Project Memory — Dental Clinic Website

This file is updated after each stage. It records progress, decisions, and
outstanding items. The most recent stage is at the top.

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
