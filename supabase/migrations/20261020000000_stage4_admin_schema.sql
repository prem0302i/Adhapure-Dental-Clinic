-- Stage 4 Database Migration: Admin Panel, Schema & Row Level Security (RLS)

-- Enable pgcrypto for UUID generation if not already enabled
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ---------------------------------------------------------------------------
-- 1. Admins Table
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.admins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.admins ENABLE ROW LEVEL SECURITY;

-- Helper function to check if the current authenticated user is an authorized admin
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

-- RLS for admins table:
-- Admins can view the admins list; authenticated users can check if their own user_id is in admins.
CREATE POLICY "Admins can view admin list"
  ON public.admins
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid() OR public.is_admin());

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
-- 2. Doctors Table
-- ---------------------------------------------------------------------------
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

ALTER TABLE public.doctors ENABLE ROW LEVEL SECURITY;

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

-- ---------------------------------------------------------------------------
-- 3. Treatments Table
-- ---------------------------------------------------------------------------
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

ALTER TABLE public.treatments ENABLE ROW LEVEL SECURITY;

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

-- ---------------------------------------------------------------------------
-- 4. About Content Table (Single record design)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.about_content (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  intro TEXT,
  philosophy JSONB NOT NULL DEFAULT '[]'::jsonb,
  facilities JSONB NOT NULL DEFAULT '[]'::jsonb,
  qualifications JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.about_content ENABLE ROW LEVEL SECURITY;

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

-- ---------------------------------------------------------------------------
-- 5. Smile Gallery Cases Table
-- Public site shows a case ONLY if is_published AND consent_confirmed are both true.
-- Database enforces this constraint at the RLS level!
-- ---------------------------------------------------------------------------
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

ALTER TABLE public.gallery_cases ENABLE ROW LEVEL SECURITY;

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
-- 6. Clinic Settings Table (Single record)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.clinic_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_name TEXT,
  phone_display TEXT,
  phone_href TEXT,
  whatsapp_number TEXT,
  email TEXT,
  address_line1 TEXT,
  address_line2 TEXT,
  maps_link TEXT,
  directions_link TEXT,
  instagram_link TEXT,
  facebook_link TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.clinic_settings ENABLE ROW LEVEL SECURITY;

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

-- ---------------------------------------------------------------------------
-- 7. Opening Hours Table
-- ---------------------------------------------------------------------------
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

ALTER TABLE public.opening_hours ENABLE ROW LEVEL SECURITY;

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

-- ---------------------------------------------------------------------------
-- 8. Storage Buckets & Policies
-- ---------------------------------------------------------------------------
INSERT INTO storage.buckets (id, name, public)
VALUES ('doctor-photos', 'doctor-photos', true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public)
VALUES ('gallery-cases', 'gallery-cases', true)
ON CONFLICT (id) DO NOTHING;

-- Public can view images in these buckets
CREATE POLICY "Public can view doctor photos"
  ON storage.objects FOR SELECT
  TO anon, authenticated
  USING (bucket_id = 'doctor-photos');

CREATE POLICY "Public can view gallery photos"
  ON storage.objects FOR SELECT
  TO anon, authenticated
  USING (bucket_id = 'gallery-cases');

-- Only verified admins can insert, update, or delete images
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
