# Dental Clinic Website

A high-performance, accessible, responsive dental clinic website built with **React**, **TypeScript**, **React Router**, and **Tailwind CSS** (Vite framework).

---

## 1. How to run locally

### Prerequisites
- Node.js 18+ (tested on Node 20)
- npm 9+

### Commands
```bash
# Install dependencies
npm install

# Start local development server (runs on http://localhost:5173)
npm run dev

# Run TypeScript typecheck
npm run typecheck

# Build for production
npm run build

# Preview production build locally
npm run preview
```

---

## 2. Environment variables

1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```
2. Configure the variables:
   ```env
   # WhatsApp number in international format, digits only, no + symbol.
   # Example: 447700900123 or 919876543210
   VITE_WHATSAPP_NUMBER=
   ```
3. During development, if `VITE_WHATSAPP_NUMBER` is empty or omitted, WhatsApp buttons automatically fall back to `https://wa.me/?text=...` allowing the user to select a recipient manually.

---

## 3. How to edit clinic information (`src/lib/clinic-config.ts`)

All clinic-wide details are managed centrally in `src/lib/clinic-config.ts`. To update details:

- **Clinic Name & Tagline**:
  ```ts
  name: "Apex Dental Care",
  shortName: "Apex Dental",
  tagline: "Gentle, patient-focused dental care for the whole family",
  ```
- **Address & Google Maps**:
  ```ts
  address: {
    line1: "123 High Street",
    line2: "Cityville, AB12 3CD",
    mapsLink: "https://maps.google.com/?q=...", // Clinic location on Google Maps
    directionsLink: "https://www.google.com/maps/dir/?api=1&destination=...", // Directions
  },
  ```
- **Phone & Email**:
  ```ts
  contact: {
    phoneDisplay: "+44 20 7946 0912",
    phoneHref: "tel:+442079460912",
    whatsappNumber: import.meta.env.VITE_WHATSAPP_NUMBER ?? "",
    email: "enquiries@apexdental.co.uk",
  },
  ```
- **Opening Hours**:
  ```ts
  hours: [
    { day: "Monday – Friday", hours: "8:30 am – 6:00 pm" },
    { day: "Saturday", hours: "9:00 am – 2:00 pm" },
    { day: "Sunday", hours: "Closed" },
  ],
  ```

---

## 4. How to add Doctors, Services, and Gallery Cases

All entries are strictly typed in `src/lib/clinic-config.ts`.

### Adding / Editing Doctors (`placeholderDoctors` array)
```ts
export const placeholderDoctors: Doctor[] = [
  {
    slug: "dr-sarah-jenkins",
    name: "Dr. Sarah Jenkins",
    qualifications: "BDS (Hons), MFDS RCPS",
    specialisation: "General & Cosmetic Dentistry",
    experienceYears: 12,
    bio: "Dr. Jenkins has over 12 years of clinical experience with a focus on minimally invasive restorations and gentle preventative care.",
    photo: "/images/doctors/sarah-jenkins.jpg", // Optional image URL
    placeholder: false, // Set to false once verified
  },
];
```

### Adding / Editing Services (`services` array)
Available icons: `Stethoscope`, `Sparkles`, `ShieldCheck`, `Hammer`, `Sun`, `AlignHorizontalJustifyCenter`, `Anchor`, `Crown`, `Baby`, `Smile`.
```ts
export const services: Service[] = [
  {
    slug: "preventative-checkup",
    name: "Routine Examination & Hygiene",
    summary: "Comprehensive dental check-ups, digital diagnostics, and periodontal care.",
    icon: "Sparkles",
  },
];
```

### Adding Smile Gallery Cases (`galleryCases` array)
> **Ethical & Legal Requirement:** Every case MUST have confirmed patient consent before publication (`consentConfirmed: true`). If `galleryCases` is empty or all items have `consentConfirmed: false`, the gallery displays an honest "Photos coming soon" empty state.
```ts
export const galleryCases: GalleryCase[] = [
  {
    id: "case-01",
    caption: "Porcelain veneers to restore chipped incisors",
    beforeSrc: "/images/gallery/case-01-before.jpg",
    afterSrc: "/images/gallery/case-01-after.jpg",
    consentConfirmed: true, // MANDATORY: only cases with true are rendered
  },
];
```

---

## 5. How to launch the site

When real client details, images, and legal texts have been supplied and approved:

1. **Turn off placeholder notices**:
   - In pages/components where `<PlaceholderNotice ... />` or `<Placeholder ... />` is used, remove or comment out the placeholder banners.
   - Set `placeholder: false` on verified doctor objects.
2. **Remove `noindex` and enable search indexing**:
   - In `index.html`, remove or change line 6:
     ```html
     <!-- Before launch -->
     <meta name="robots" content="noindex,nofollow" />

     <!-- After launch -->
     <meta name="robots" content="index,follow" />
     ```
   - In `public/robots.txt`, update to allow search engine indexing:
     ```txt
     User-agent: *
     Allow: /

     Sitemap: https://yourdomain.com/sitemap.xml
     ```
   - In `public/sitemap.xml`, replace `https://example.com/` with the confirmed live domain.
3. **Form Submission Configuration**:
   - When connecting the appointment enquiry form to a live backend (such as Supabase Edge Functions, Formspree, or an email service), update the `handleSubmit` endpoint in `src/pages/AppointmentPage.tsx` and ensure server-side validation using `src/lib/validation.ts` is enforced.

---

## 6. Deployment steps for Vercel

The site is built as a static Single Page Application (SPA). To deploy to Vercel:

1. **Push repository to GitHub / GitLab / Bitbucket**.
2. **Import project into Vercel**:
   - Framework Preset: `Vite`
   - Root Directory: `./`
   - Build Command: `npm run build` (or `tsc -b && vite build`)
   - Output Directory: `dist`
   - Install Command: `npm install`
3. **Add Environment Variables in Vercel Project Settings**:
   - Key: `VITE_WHATSAPP_NUMBER`
   - Value: `[CLIENT_PHONE_NUMBER_WITHOUT_PLUS]`
4. **Configure Single Page Application (SPA) routing**:
   If navigating directly to `/about` or `/services` returns a 404 on Vercel, create a `vercel.json` file in the root directory:
   ```json
   {
     "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
   }
   ```
5. **Verify live build**:
   - Visit the provided `*.vercel.app` domain.
   - Verify all routes (`/`, `/about`, `/services`, `/doctors`, `/gallery`, `/appointment`, `/contact`, `/privacy`).
   - Check WhatsApp click-to-chat links and Google Maps links.
# Adhapure-Dental-Clinic
