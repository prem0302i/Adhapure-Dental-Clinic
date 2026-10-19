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

## Support
14 days of bug fixes for the agreed deliverables after launch.

## Blocked until the client supplies
Clinic name, logo, address, Maps link, phone and WhatsApp numbers, email, hours, treatments list, doctor details and photos, clinic photos, authorised gallery images, testimonials with permission, privacy wording, domain.
