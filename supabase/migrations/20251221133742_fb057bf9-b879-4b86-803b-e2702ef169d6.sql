-- Fix stripe_events table - add server-only policy (no client access, only service_role)
-- This is intentional - stripe_events should only be accessed by edge functions using service_role
-- Adding an explicit deny-all policy makes this clear

-- Add a policy that explicitly allows no access for authenticated users
-- (Edge functions bypass RLS with service_role key)
CREATE POLICY "No client access to stripe_events"
  ON public.stripe_events FOR ALL
  TO authenticated
  USING (false);

-- Fix function search_path for update_updated_at
DROP FUNCTION IF EXISTS public.update_updated_at() CASCADE;

CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Recreate the triggers that were dropped
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER update_generation_jobs_updated_at
  BEFORE UPDATE ON public.generation_jobs
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();