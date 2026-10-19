-- Stage 4 Idempotent Database Seed Script
-- Loads initial placeholder content into tables so the admin panel starts with something to edit.
-- Rules: Never seed real-looking doctors, reviews or addresses. Placeholders only.

-- 1. Seed Clinic Settings (Single Record)
INSERT INTO public.clinic_settings (
  id,
  clinic_name,
  phone_display,
  phone_href,
  whatsapp_number,
  email,
  address_line1,
  address_line2,
  maps_link,
  directions_link,
  instagram_link,
  facebook_link
)
VALUES (
  '00000000-0000-0000-0000-000000000001',
  '[CLINIC NAME]',
  '[PHONE NUMBER]',
  '',
  '',
  '',
  '[CLINIC ADDRESS LINE 1]',
  '[CITY, POSTAL CODE]',
  '',
  '',
  '',
  ''
)
ON CONFLICT (id) DO NOTHING;

-- 2. Seed About Content (Single Record)
INSERT INTO public.about_content (
  id,
  intro,
  philosophy,
  facilities,
  qualifications
)
VALUES (
  '00000000-0000-0000-0000-000000000002',
  'A dental practice built around you — your comfort, your questions, and your care. [CLINIC NAME] was founded with a simple belief: that going to the dentist should be straightforward and comfortable.',
  '[
    {"title": "Patient first", "body": "We take time to listen and explain every step of your care in plain language. No rushed appointments, no surprise recommendations."},
    {"title": "Family-friendly", "body": "We welcome patients of all ages and aim to create a calm, welcoming environment — especially for those who feel anxious about dental visits."},
    {"title": "Preventive focus", "body": "We believe good oral health starts with education and regular maintenance. We guide every patient on at-home care between visits."},
    {"title": "Safe and hygienic", "body": "All instruments are sterilised to strict protocols. We follow current infection-control guidelines at every appointment."}
  ]'::jsonb,
  '[
    "Modern treatment rooms — details to be confirmed",
    "Digital X-rays — details to be confirmed",
    "Accessible waiting area — details to be confirmed",
    "Private consultation space — details to be confirmed"
  ]'::jsonb,
  '[
    {"label": "[REGULATORY BODY / REGISTRATION NUMBER]", "description": "Registration details will be confirmed and displayed here."},
    {"label": "[PROFESSIONAL MEMBERSHIPS]", "description": "Professional body memberships will be listed here once verified."}
  ]'::jsonb
)
ON CONFLICT (id) DO NOTHING;

-- 3. Seed Placeholder Doctors (Marked as published or draft placeholder)
INSERT INTO public.doctors (
  name,
  qualifications,
  specialisation,
  experience,
  bio,
  photo_url,
  sort_order,
  is_published
)
VALUES
  (
    '[DOCTOR NAME]',
    '[QUALIFICATIONS]',
    '[SPECIALISATION]',
    'To be confirmed',
    'A short biography will appear here once verified details are supplied by the clinic.',
    '',
    1,
    true
  ),
  (
    '[DOCTOR NAME]',
    '[QUALIFICATIONS]',
    '[SPECIALISATION]',
    'To be confirmed',
    'A short biography will appear here once verified details are supplied by the clinic.',
    '',
    2,
    true
  )
ON CONFLICT DO NOTHING;

-- 4. Seed Treatments (Matches clinicConfig placeholder categories)
INSERT INTO public.treatments (slug, name, summary, details, icon, sort_order, is_published)
VALUES
  ('general', 'General dentistry', 'Routine check-ups and care to keep teeth and gums healthy.', 'Comprehensive examination, preventive advice, and gentle routine maintenance.', 'Stethoscope', 1, true),
  ('cleaning', 'Cleaning and prevention', 'Professional cleaning and guidance for long-term oral health.', 'Scale and polish treatments performed to protect against gum disease.', 'Sparkles', 2, true),
  ('root-canal', 'Root canal treatment', 'Care to repair and save a damaged tooth.', 'Careful endodontic therapy to alleviate discomfort and retain natural teeth.', 'ShieldCheck', 3, true),
  ('fillings', 'Fillings', 'Durable restorations for teeth affected by decay.', 'Tooth-coloured restorations designed for strength and natural aesthetics.', 'Hammer', 4, true),
  ('whitening', 'Teeth whitening', 'Professional whitening to brighten your smile.', 'Safe, dentist-supervised tooth whitening options tailored to your teeth.', 'Sun', 5, true),
  ('braces', 'Braces and aligners', 'Options to straighten and align teeth over time.', 'Clear aligners and orthodontic consultations for alignment correction.', 'AlignHorizontalJustifyCenter', 6, true),
  ('implants', 'Dental implants', 'Replacement tooth roots for missing teeth.', 'Long-lasting implant-supported crowns and bridges to replace missing teeth.', 'Anchor', 7, true),
  ('crowns', 'Crowns and bridges', 'Restorations to rebuild or replace damaged teeth.', 'Custom precision crowns and bridges to restore chewing function and appearance.', 'Crown', 8, true),
  ('pediatric', 'Pediatric dentistry', 'Gentle dental care tailored for children.', 'A calm, supportive setting introducing young patients to good dental habits.', 'Baby', 9, true),
  ('cosmetic', 'Cosmetic dentistry', 'Treatments focused on the appearance of your smile.', 'Individualised cosmetic evaluations to enhance dental harmony.', 'Smile', 10, true)
ON CONFLICT (slug) DO NOTHING;

-- 5. Seed Opening Hours (Initial placeholders)
INSERT INTO public.opening_hours (day, open_time, close_time, is_closed, note, sort_order)
VALUES
  ('Monday – Friday', '', '', false, '[TO BE CONFIRMED]', 1),
  ('Saturday', '', '', false, '[TO BE CONFIRMED]', 2),
  ('Sunday', '', '', true, '[TO BE CONFIRMED]', 3)
ON CONFLICT DO NOTHING;
