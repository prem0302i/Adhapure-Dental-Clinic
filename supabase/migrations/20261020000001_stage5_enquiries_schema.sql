-- Stage 5 Database Migration: Enquiries (Appointments) & Security Hardening
-- Idempotent

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
-- 1. Enquiries Table
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

CREATE POLICY "Public can insert enquiries"
  ON public.enquiries
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (consent_given = true AND status = 'new');

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
