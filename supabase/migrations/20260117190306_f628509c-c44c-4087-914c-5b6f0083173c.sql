-- Remove email from public profiles to reduce PII exposure
ALTER TABLE public.profiles
  DROP COLUMN IF EXISTS email;

-- Recreate handle_new_user trigger function without storing email in public schema
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Create or update profile (no email stored in public schema)
  INSERT INTO public.profiles (id, full_name, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name'),
    NEW.raw_user_meta_data->>'avatar_url'
  )
  ON CONFLICT (id) DO UPDATE
    SET full_name = EXCLUDED.full_name,
        avatar_url = EXCLUDED.avatar_url,
        updated_at = now();

  -- Assign default user role
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'user')
  ON CONFLICT (user_id, role) DO NOTHING;

  -- Initialize credit balance with welcome bonus
  INSERT INTO public.credit_balances (user_id, balance)
  VALUES (NEW.id, 10)
  ON CONFLICT (user_id) DO NOTHING;

  -- Record the bonus in ledger
  INSERT INTO public.credits_ledger (user_id, tx_type, amount, balance_after, description, idempotency_key)
  VALUES (NEW.id, 'bonus', 10, 10, 'Welcome bonus', 'welcome_' || NEW.id::text)
  ON CONFLICT (idempotency_key) DO NOTHING;

  RETURN NEW;
END;
$$;