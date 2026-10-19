# Architecture

## Stack
- **Framework:** Next.js (App Router) with TypeScript
- **Styling:** Tailwind CSS, with design tokens in `tailwind.config.ts`
- **Icons:** Lucide (`lucide-react`)
- **Fonts:** `next/font` (Fraunces for headings, Figtree for body)
- **Hosting:** Vercel or similar. Do not deploy or incur paid costs without approval. Check current hosting terms before promising anything is free.

> **Bolt note:** If Bolt's in-browser environment cannot run Next.js reliably, stop and ask before switching. The fallback is Vite + React + React Router + TypeScript + Tailwind, keeping the same components, config and folder layout. Explain what changes (no server actions or API routes, so the form needs a different submission method).

## Folder structure
```text
dental-clinic-website/
├── public/images/
├── src/
│   ├── app/
│   │   ├── layout.tsx
│   │   ├── globals.css
│   │   ├── page.tsx                  (Home)
│   │   ├── about/page.tsx
│   │   ├── services/page.tsx
│   │   ├── doctors/page.tsx
│   │   ├── gallery/page.tsx
│   │   ├── appointment/page.tsx
│   │   └── contact/page.tsx
│   ├── components/
│   │   ├── layout/    Header, Footer
│   │   ├── sections/  Hero, ServicesOverview, ClinicIntro, TeamPreview, ...
│   │   ├── forms/     EnquiryForm
│   │   └── ui/        Button, WhatsAppButton, Placeholder
│   ├── lib/
│   │   ├── clinic-config.ts          (single source of clinic details)
│   │   └── validation.ts             (shared form validation)
│   └── types/
├── .env.example
└── README.md
```
Do not create empty files just to match this tree.

## Key decisions
1. **Central config:** all clinic details, nav items, services and the WhatsApp link builder live in `src/lib/clinic-config.ts`. Components read from it. Nothing is hard-coded in components.
2. **Server components by default.** Use client components only where needed (mobile menu, form, lightbox).
3. **WhatsApp:** `https://wa.me/<digits>?text=<encoded message>`. Number comes from `NEXT_PUBLIC_WHATSAPP_NUMBER`. If empty, fall back to `https://wa.me/?text=...` so the button still works during development.
4. **Appointment enquiry form:** decide the submission method before building it, and explain the trade-offs to the owner.
   - *Option A (simplest):* server action or API route that validates and sends an email to the clinic through a provider configured with environment variables. No database.
   - *Option B:* store enquiries in Supabase with server-side validation and Row Level Security. Only if the owner confirms persistent storage is needed.
   - Do not add a database "just in case". Never fake a success message. Show success only when the submission truly succeeded.
5. **Spam protection:** honeypot field plus basic rate limiting, proportionate to a small clinic site.
6. **Secrets:** private keys only in server-side environment variables. Never prefix secrets with `NEXT_PUBLIC_`. Never expose a Supabase service-role key to the browser.
7. **Maps:** link or embed using the client's real Google Maps URL, stored in config. Placeholder until supplied.
8. **Indexing:** keep `robots: noindex` until placeholders are replaced. Remove it only at launch.
9. **Gallery:** component driven by a typed array of cases. Empty array renders a clear "coming soon" state, never fake cases.

## Types (minimum)
`Service`, `Doctor`, `GalleryCase { id, beforeSrc, afterSrc, caption, consentConfirmed: boolean }`, `Testimonial { quote, name, consentConfirmed }`, `EnquiryInput`.
