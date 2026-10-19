# Project Requirements Document: Dental Clinic Website

## 1. Overview
A new, premium, modern website for a dental clinic client. There is no existing site. The site must build trust, showcase treatments and doctors, show genuine reviews and before-and-after cases, give location details, and make it easy to contact the clinic or send an appointment enquiry.

**Critical rule:** Never invent the clinic name, address, phone, doctor credentials, prices, testimonials, ratings, opening hours or patient results. Use clearly marked placeholders such as `[CLINIC NAME]`, `[WHATSAPP NUMBER]`, `[CLINIC ADDRESS]` until the client supplies verified information. Do not present placeholders as real information.

## 2. Audience
Dental patients, families and prospective patients, mostly on mobile phones.

## 3. Pages (seven)
1. **Home**: hero with headline and primary call to action ("Request an appointment"), WhatsApp button, treatments overview, clinic intro, doctor preview, before-and-after preview, testimonials (only when real ones exist), patient-focused benefits, location preview, footer.
2. **About the clinic**: introduction, philosophy of care, facilities and equipment (only what the client confirms), photos if supplied, verified qualifications and affiliations. No unsupported claims.
3. **Services and treatments**: only services the client confirms. Each has a name, short explanation, image or icon, and an enquiry button. No prices, no promised outcomes. Example categories: general dentistry, cleaning and prevention, root canal, fillings, whitening, braces, implants, crowns and bridges, pediatric, cosmetic.
4. **Our doctors**: profile cards with photo, name, verified qualifications, specialisation, experience, short bio, enquiry button. Placeholder profiles until real data arrives.
5. **Smile gallery**: responsive before-and-after gallery, clear Before and After labels, optional lightbox, mobile-friendly. Never use fake cases, stock photos or AI images as patient results. Placeholders until authorised photos with consent exist.
6. **Appointment enquiry**: form with patient name, phone, optional email, preferred date, preferred time range, treatment of interest, optional short message, consent and privacy notice, submit button, clear success and error messages.
   - A submission is an **enquiry, not a confirmed appointment**. State plainly that clinic staff will contact the patient to confirm availability.
   - Collect only what is needed. No medical history, diagnoses or ID documents.
7. **Contact and location**: phone, WhatsApp button, email if provided, full address, confirmed opening hours, Google Maps embed or link, directions button, link to the enquiry form, footer. Use a placeholder until the real address or Maps link is supplied.

## 4. WhatsApp
Click-to-chat buttons on Home, treatment sections, doctor profiles, the enquiry page and the Contact page. Number is configurable (placeholder until supplied). Prefilled message: "Hello, I would like to enquire about an appointment at your dental clinic." Do not claim messages are tracked or stored by the site. No WhatsApp API automation.

## 5. Non-functional requirements
- Responsive: small phones, large phones, tablets, laptops, desktops. No horizontal overflow.
- Accessible: semantic HTML, labels on every field, keyboard navigation, visible focus, good contrast, alt text, reduced-motion support.
- SEO: page titles and descriptions, semantic headings, clean URLs, Open Graph, sitemap, robots. No fabricated ratings, reviews, addresses or structured data. No promises of rankings.
- Performance: optimised images, lazy loading below the fold, minimal client JavaScript.
- Security and privacy: no secrets in frontend code, server-side validation, spam protection, no unnecessary logging of form data, privacy policy placeholder for the clinic to review, no compliance claims without verification.

## 6. In scope
Seven pages, premium responsive design, WhatsApp click-to-chat, Google Maps integration, services section, doctor section, gallery component, testimonial section, enquiry form, basic SEO, functional testing, deployment assistance.

## 7. Out of scope (needs separate approval and quote)
Domain registration, paid hosting or subscriptions, professional photography, copywriting or medical verification, CMS or admin dashboard, live appointment slots, automatic confirmations, SMS or WhatsApp API messaging, online payments, patient accounts or records, multiple languages or branches, SEO campaigns, ads, extra pages, new features after scope approval, ongoing maintenance beyond the support period. If asked for any of these, explain the extra work and cost first and wait for approval.

## 8. Content needed from the client
Clinic name and logo; address and Google Maps link; phone and WhatsApp numbers; email; opening hours; list of treatments; doctor names, photos, qualifications and bios; clinic photos; authorised before-and-after images; genuine testimonials with permission; social links; domain; privacy policy wording; brand guidelines.

## 9. Acceptance checklist
- [ ] All seven pages implemented and linked
- [ ] Consistent premium design on mobile, tablet and desktop
- [ ] Every navigation link and call to action works
- [ ] WhatsApp links open the correct chat
- [ ] Maps points to the real clinic
- [ ] Form validates and gives truthful feedback; never claims a confirmed appointment
- [ ] Doctors, testimonials and gallery use verified, permitted content
- [ ] No fabricated details or exposed credentials
- [ ] SEO metadata set; tested before deployment
- [ ] Client approved content and layout; handover instructions provided
