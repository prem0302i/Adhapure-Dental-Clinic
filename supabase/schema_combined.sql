-- ===========================================================================
-- DENTAL CLINIC — COMPLETE COMBINED SUPABASE SCHEMA & POLICIES (STAGE 5)
-- Idempotent script for Supabase SQL Editor
-- Includes:
--   1. Extensions and updated_at trigger helper
--   2. Admins table and is_admin() security definer function
--   3. Content tables: clinic_settings, opening_hours, about_content,
--      doctors, treatments, gallery_cases
--   4. Operations: enquiries table with strict validation constraints
--   5. Row Level Security (RLS) on EVERY table
--   6. Storage buckets: doctor-photos, gallery-cases with RLS
-- ===========================================================================

-- 1. EXTENSIONS & TRIGGER HELPER
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- ---------------------------------------------------------------------------
-- 2. ADMINS TABLE & is_admin() FUNCTION
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.admins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

DROP TRIGGER IF EXISTS set_admins_updated_at ON public.admins;
CREATE TRIGGER set_admins_updated_at
  BEFORE UPDATE ON public.admins
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

ALTER TABLE public.admins ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.admins
    WHERE admins.user_id = auth.uid()
  );
$$;

DROP POLICY IF EXISTS "Admins can view admin list" ON public.admins;
DROP POLICY IF EXISTS "Only admins can add new admins" ON public.admins;
DROP POLICY IF EXISTS "Only admins can delete admins" ON public.admins;
DROP POLICY IF EXISTS "Only admins can view admin list" ON public.admins;

CREATE POLICY "Admins can view admin list"
  ON public.admins
  FOR SELECT
  TO authenticated
  USING (public.is_admin());

CREATE POLICY "Only admins can add new admins"
  ON public.admins
  FOR INSERT
  TO authenticated
  WITH CHECK (public.is_admin());

CREATE POLICY "Only admins can delete admins"
  ON public.admins
  FOR DELETE
  TO authenticated
  USING (public.is_admin());

-- ---------------------------------------------------------------------------
-- 3. CONTENT TABLES
-- ---------------------------------------------------------------------------

-- 3.1 CLINIC SETTINGS
CREATE TABLE IF NOT EXISTS public.clinic_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_name TEXT,
  phone TEXT,
  phone_display TEXT,
  phone_href TEXT,
  whatsapp_number TEXT,
  email TEXT,
  address TEXT,
  address_line1 TEXT,
  address_line2 TEXT,
  city TEXT,
  postal_code TEXT,
  maps_link TEXT,
  directions_link TEXT,
  social_links JSONB NOT NULL DEFAULT '{}'::jsonb,
  instagram_link TEXT,
  facebook_link TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

DROP TRIGGER IF EXISTS set_clinic_settings_updated_at ON public.clinic_settings;
CREATE TRIGGER set_clinic_settings_updated_at
  BEFORE UPDATE ON public.clinic_settings
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

ALTER TABLE public.clinic_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can view clinic settings" ON public.clinic_settings;
DROP POLICY IF EXISTS "Admins have full access to clinic settings" ON public.clinic_settings;

CREATE POLICY "Public can view clinic settings"
  ON public.clinic_settings
  FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Admins have full access to clinic settings"
  ON public.clinic_settings
  FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- 3.2 OPENING HOURS
CREATE TABLE IF NOT EXISTS public.opening_hours (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  day TEXT NOT NULL,
  open_time TEXT,
  close_time TEXT,
  is_closed BOOLEAN NOT NULL DEFAULT false,
  note TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

DROP TRIGGER IF EXISTS set_opening_hours_updated_at ON public.opening_hours;
CREATE TRIGGER set_opening_hours_updated_at
  BEFORE UPDATE ON public.opening_hours
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

ALTER TABLE public.opening_hours ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can view opening hours" ON public.opening_hours;
DROP POLICY IF EXISTS "Admins have full access to opening hours" ON public.opening_hours;

CREATE POLICY "Public can view opening hours"
  ON public.opening_hours
  FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Admins have full access to opening hours"
  ON public.opening_hours
  FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- 3.3 ABOUT CONTENT
CREATE TABLE IF NOT EXISTS public.about_content (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  intro TEXT,
  philosophy JSONB NOT NULL DEFAULT '[]'::jsonb,
  facilities JSONB NOT NULL DEFAULT '[]'::jsonb,
  qualifications JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

DROP TRIGGER IF EXISTS set_about_content_updated_at ON public.about_content;
CREATE TRIGGER set_about_content_updated_at
  BEFORE UPDATE ON public.about_content
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

ALTER TABLE public.about_content ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can view about content" ON public.about_content;
DROP POLICY IF EXISTS "Admins have full access to about content" ON public.about_content;

CREATE POLICY "Public can view about content"
  ON public.about_content
  FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Admins have full access to about content"
  ON public.about_content
  FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- 3.4 DOCTORS
CREATE TABLE IF NOT EXISTS public.doctors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  qualifications TEXT,
  specialisation TEXT,
  experience TEXT,
  bio TEXT,
  photo_url TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_published BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

DROP TRIGGER IF EXISTS set_doctors_updated_at ON public.doctors;
CREATE TRIGGER set_doctors_updated_at
  BEFORE UPDATE ON public.doctors
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

ALTER TABLE public.doctors ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can view published doctors" ON public.doctors;
DROP POLICY IF EXISTS "Admins have full access to doctors" ON public.doctors;

CREATE POLICY "Public can view published doctors"
  ON public.doctors
  FOR SELECT
  TO anon, authenticated
  USING (is_published = true);

CREATE POLICY "Admins have full access to doctors"
  ON public.doctors
  FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- 3.5 TREATMENTS
CREATE TABLE IF NOT EXISTS public.treatments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  summary TEXT,
  details TEXT,
  icon TEXT,
  image_url TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_published BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

DROP TRIGGER IF EXISTS set_treatments_updated_at ON public.treatments;
CREATE TRIGGER set_treatments_updated_at
  BEFORE UPDATE ON public.treatments
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

ALTER TABLE public.treatments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can view published treatments" ON public.treatments;
DROP POLICY IF EXISTS "Admins have full access to treatments" ON public.treatments;

CREATE POLICY "Public can view published treatments"
  ON public.treatments
  FOR SELECT
  TO anon, authenticated
  USING (is_published = true);

CREATE POLICY "Admins have full access to treatments"
  ON public.treatments
  FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- 3.6 GALLERY CASES (CONSENT RULE ENFORCED IN DATABASE)
CREATE TABLE IF NOT EXISTS public.gallery_cases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT,
  before_url TEXT,
  after_url TEXT,
  caption TEXT,
  consent_confirmed BOOLEAN NOT NULL DEFAULT false,
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_published BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

DROP TRIGGER IF EXISTS set_gallery_cases_updated_at ON public.gallery_cases;
CREATE TRIGGER set_gallery_cases_updated_at
  BEFORE UPDATE ON public.gallery_cases
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

ALTER TABLE public.gallery_cases ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can view published cases with consent only" ON public.gallery_cases;
DROP POLICY IF EXISTS "Admins have full access to gallery cases" ON public.gallery_cases;

CREATE POLICY "Public can view published cases with consent only"
  ON public.gallery_cases
  FOR SELECT
  TO anon, authenticated
  USING (is_published = true AND consent_confirmed = true);

CREATE POLICY "Admins have full access to gallery cases"
  ON public.gallery_cases
  FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- ---------------------------------------------------------------------------
-- 4. OPERATIONS: ENQUIRIES TABLE
-- (No medical history, no diagnoses, no ID documents)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.enquiries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_name TEXT NOT NULL CHECK (length(trim(patient_name)) >= 2),
  phone TEXT NOT NULL CHECK (length(trim(phone)) >= 6),
  email TEXT,
  preferred_date DATE NOT NULL,
  preferred_time_range TEXT NOT NULL CHECK (length(trim(preferred_time_range)) > 0),
  treatment_id UUID REFERENCES public.treatments(id) ON DELETE SET NULL,
  treatment_name TEXT NOT NULL CHECK (length(trim(treatment_name)) > 0),
  message TEXT CHECK (message IS NULL OR length(message) <= 500),
  consent_given BOOLEAN NOT NULL DEFAULT true CHECK (consent_given = true),
  status TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'contacted', 'confirmed', 'cancelled')),
  confirmed_date DATE,
  confirmed_time TEXT,
  staff_note TEXT,
  source TEXT DEFAULT 'website',
  confirmed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

DROP TRIGGER IF EXISTS set_enquiries_updated_at ON public.enquiries;
CREATE TRIGGER set_enquiries_updated_at
  BEFORE UPDATE ON public.enquiries
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

ALTER TABLE public.enquiries ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can insert enquiries" ON public.enquiries;
DROP POLICY IF EXISTS "Admins can view enquiries" ON public.enquiries;
DROP POLICY IF EXISTS "Admins can update enquiries" ON public.enquiries;
DROP POLICY IF EXISTS "Admins can delete enquiries" ON public.enquiries;

-- Public can ONLY insert new enquiries with consent. Cannot SELECT, UPDATE or DELETE.
CREATE POLICY "Public can insert enquiries"
  ON public.enquiries
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (consent_given = true AND status = 'new');

-- Admins can read, update, and delete enquiries
CREATE POLICY "Admins can view enquiries"
  ON public.enquiries
  FOR SELECT
  TO authenticated
  USING (public.is_admin());

CREATE POLICY "Admins can update enquiries"
  ON public.enquiries
  FOR UPDATE
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

CREATE POLICY "Admins can delete enquiries"
  ON public.enquiries
  FOR DELETE
  TO authenticated
  USING (public.is_admin());

-- ---------------------------------------------------------------------------
-- 5. STORAGE BUCKETS & POLICIES
-- ---------------------------------------------------------------------------
INSERT INTO storage.buckets (id, name, public)
VALUES ('doctor-photos', 'doctor-photos', true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public)
VALUES ('gallery-cases', 'gallery-cases', true)
ON CONFLICT (id) DO NOTHING;

-- Public can read published images
DROP POLICY IF EXISTS "Public can view doctor photos" ON storage.objects;
DROP POLICY IF EXISTS "Public can view gallery photos" ON storage.objects;

CREATE POLICY "Public can view doctor photos"
  ON storage.objects FOR SELECT
  TO anon, authenticated
  USING (bucket_id = 'doctor-photos');

CREATE POLICY "Public can view gallery photos"
  ON storage.objects FOR SELECT
  TO anon, authenticated
  USING (bucket_id = 'gallery-cases');

-- Admin write access
DROP POLICY IF EXISTS "Admins can upload doctor photos" ON storage.objects;
DROP POLICY IF EXISTS "Admins can update doctor photos" ON storage.objects;
DROP POLICY IF EXISTS "Admins can delete doctor photos" ON storage.objects;
DROP POLICY IF EXISTS "Admins can upload gallery photos" ON storage.objects;
DROP POLICY IF EXISTS "Admins can update gallery photos" ON storage.objects;
DROP POLICY IF EXISTS "Admins can delete gallery photos" ON storage.objects;

CREATE POLICY "Admins can upload doctor photos"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'doctor-photos' AND public.is_admin());

CREATE POLICY "Admins can update doctor photos"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (bucket_id = 'doctor-photos' AND public.is_admin());

CREATE POLICY "Admins can delete doctor photos"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'doctor-photos' AND public.is_admin());

CREATE POLICY "Admins can upload gallery photos"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'gallery-cases' AND public.is_admin());

CREATE POLICY "Admins can update gallery photos"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (bucket_id = 'gallery-cases' AND public.is_admin());

CREATE POLICY "Admins can delete gallery photos"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'gallery-cases' AND public.is_admin());
