-- Add explicit restrictive policies to prevent user modifications on user_roles table
-- This prevents privilege escalation attacks where users could grant themselves admin roles

-- Deny all INSERT operations from users (only service_role can insert)
CREATE POLICY "Deny user insert on user_roles"
  ON public.user_roles
  FOR INSERT
  TO authenticated
  WITH CHECK (false);

-- Deny all UPDATE operations from users (only service_role can update)
CREATE POLICY "Deny user update on user_roles"
  ON public.user_roles
  FOR UPDATE
  TO authenticated
  USING (false)
  WITH CHECK (false);

-- Deny all DELETE operations from users (only service_role can delete)
CREATE POLICY "Deny user delete on user_roles"
  ON public.user_roles
  FOR DELETE
  TO authenticated
  USING (false);