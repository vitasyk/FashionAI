-- =============================================
-- ENUMS
-- =============================================

-- Job status state machine
CREATE TYPE public.job_status AS ENUM (
  'pending',      -- Job created, awaiting credits reservation
  'queued',       -- Credits reserved, ready for processing
  'processing',   -- Worker picked up the job
  'completed',    -- Successfully generated
  'failed',       -- Generation failed (may retry)
  'cancelled'     -- User cancelled
);

-- Asset types
CREATE TYPE public.asset_type AS ENUM (
  'upload',       -- User-uploaded product image
  'generated',    -- AI-generated output
  'mask',         -- Background removal mask
  'video'         -- Generated video
);

-- Credit transaction types
CREATE TYPE public.credit_tx_type AS ENUM (
  'purchase',     -- Bought credits via Stripe
  'spend',        -- Used credits for generation
  'refund',       -- Refunded due to failed job
  'bonus',        -- Promotional credits
  'adjustment'    -- Admin adjustment
);

-- User roles
CREATE TYPE public.app_role AS ENUM (
  'admin',
  'user'
);

-- =============================================
-- TABLES
-- =============================================

-- User profiles (linked to auth.users)
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- User roles (separate table for security)
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL DEFAULT 'user',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, role)
);

-- Credit balance cache (derived from ledger, updated via trigger)
CREATE TABLE public.credit_balances (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  balance INTEGER NOT NULL DEFAULT 0 CHECK (balance >= 0),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Credits ledger (append-only audit trail)
CREATE TABLE public.credits_ledger (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  tx_type public.credit_tx_type NOT NULL,
  amount INTEGER NOT NULL, -- positive for credits in, negative for credits out
  balance_after INTEGER NOT NULL, -- snapshot of balance after this tx
  job_id UUID, -- linked job if spend/refund
  stripe_event_id UUID, -- linked stripe event if purchase
  idempotency_key TEXT, -- prevent duplicate transactions
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(idempotency_key)
);

-- Assets (uploads and generated outputs)
CREATE TABLE public.assets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  job_id UUID, -- linked generation job (null for uploads)
  asset_type public.asset_type NOT NULL,
  storage_path TEXT NOT NULL, -- path in storage bucket
  bucket_name TEXT NOT NULL DEFAULT 'uploads',
  file_name TEXT,
  file_size INTEGER,
  mime_type TEXT,
  width INTEGER,
  height INTEGER,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Generation jobs
CREATE TABLE public.generation_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status public.job_status NOT NULL DEFAULT 'pending',
  
  -- Input parameters
  input_asset_id UUID REFERENCES public.assets(id),
  prompt TEXT,
  negative_prompt TEXT,
  model_preset TEXT, -- e.g., 'fashion_model_v2'
  pose_preset TEXT,
  scene_preset TEXT,
  params JSONB DEFAULT '{}', -- additional params
  
  -- Cost tracking
  cost_credits INTEGER NOT NULL DEFAULT 10,
  credits_reserved BOOLEAN NOT NULL DEFAULT false,
  
  -- Processing metadata
  provider TEXT, -- AI provider used
  provider_job_id TEXT, -- External job ID
  worker_id TEXT, -- Which worker processed
  attempts INTEGER NOT NULL DEFAULT 0,
  max_attempts INTEGER NOT NULL DEFAULT 3,
  
  -- Timing
  queued_at TIMESTAMPTZ,
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  
  -- Results
  output_asset_ids UUID[] DEFAULT '{}',
  error_message TEXT,
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Job events (audit trail for debugging)
CREATE TABLE public.job_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id UUID NOT NULL REFERENCES public.generation_jobs(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL, -- 'created', 'queued', 'picked_up', 'completed', 'failed', 'retry'
  details JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Stripe customers (link users to Stripe)
CREATE TABLE public.stripe_customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  stripe_customer_id TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Stripe events (idempotency tracking)
CREATE TABLE public.stripe_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  stripe_event_id TEXT NOT NULL UNIQUE,
  event_type TEXT NOT NULL,
  processed BOOLEAN NOT NULL DEFAULT false,
  payload JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  processed_at TIMESTAMPTZ
);

-- =============================================
-- INDEXES
-- =============================================

CREATE INDEX idx_profiles_email ON public.profiles(email);
CREATE INDEX idx_user_roles_user_id ON public.user_roles(user_id);
CREATE INDEX idx_credit_balances_user_id ON public.credit_balances(user_id);
CREATE INDEX idx_credits_ledger_user_id ON public.credits_ledger(user_id);
CREATE INDEX idx_credits_ledger_created_at ON public.credits_ledger(created_at DESC);
CREATE INDEX idx_assets_user_id ON public.assets(user_id);
CREATE INDEX idx_assets_job_id ON public.assets(job_id);
CREATE INDEX idx_generation_jobs_user_id ON public.generation_jobs(user_id);
CREATE INDEX idx_generation_jobs_status ON public.generation_jobs(status);
CREATE INDEX idx_generation_jobs_queued ON public.generation_jobs(status, queued_at) WHERE status = 'queued';
CREATE INDEX idx_job_events_job_id ON public.job_events(job_id);
CREATE INDEX idx_stripe_customers_user_id ON public.stripe_customers(user_id);
CREATE INDEX idx_stripe_events_stripe_id ON public.stripe_events(stripe_event_id);

-- =============================================
-- FUNCTIONS
-- =============================================

-- Security definer function to check roles (avoids RLS recursion)
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- Get user's current credit balance
CREATE OR REPLACE FUNCTION public.get_credit_balance(_user_id UUID)
RETURNS INTEGER
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(balance, 0)
  FROM public.credit_balances
  WHERE user_id = _user_id
$$;

-- Update credit balance from ledger (called by trigger)
CREATE OR REPLACE FUNCTION public.update_credit_balance()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.credit_balances (user_id, balance, updated_at)
  VALUES (NEW.user_id, NEW.balance_after, now())
  ON CONFLICT (user_id) DO UPDATE
  SET balance = NEW.balance_after, updated_at = now();
  RETURN NEW;
END;
$$;

-- Handle new user signup (create profile + initial credits)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Create profile
  INSERT INTO public.profiles (id, email, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name'),
    NEW.raw_user_meta_data->>'avatar_url'
  );
  
  -- Assign default user role
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'user');
  
  -- Initialize credit balance with welcome bonus
  INSERT INTO public.credit_balances (user_id, balance)
  VALUES (NEW.id, 10); -- 10 free credits
  
  -- Record the bonus in ledger
  INSERT INTO public.credits_ledger (user_id, tx_type, amount, balance_after, description, idempotency_key)
  VALUES (NEW.id, 'bonus', 10, 10, 'Welcome bonus', 'welcome_' || NEW.id::text);
  
  RETURN NEW;
END;
$$;

-- Update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- =============================================
-- TRIGGERS
-- =============================================

-- Auto-create profile on signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Update credit_balances when ledger changes
CREATE TRIGGER on_credits_ledger_insert
  AFTER INSERT ON public.credits_ledger
  FOR EACH ROW EXECUTE FUNCTION public.update_credit_balance();

-- Update timestamps
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER update_generation_jobs_updated_at
  BEFORE UPDATE ON public.generation_jobs
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- =============================================
-- ENABLE RLS ON ALL TABLES
-- =============================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.credit_balances ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.credits_ledger ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.generation_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.job_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stripe_customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stripe_events ENABLE ROW LEVEL SECURITY;

-- =============================================
-- RLS POLICIES
-- =============================================

-- PROFILES: Users can read/update their own profile
CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- USER_ROLES: Users can read their own roles, admins can read all
CREATE POLICY "Users can view own roles"
  ON public.user_roles FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));

-- CREDIT_BALANCES: Users can read their own balance
CREATE POLICY "Users can view own credit balance"
  ON public.credit_balances FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- CREDITS_LEDGER: Users can read their own ledger (server inserts only)
CREATE POLICY "Users can view own credits ledger"
  ON public.credits_ledger FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- ASSETS: Users can CRUD their own assets
CREATE POLICY "Users can view own assets"
  ON public.assets FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own assets"
  ON public.assets FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own assets"
  ON public.assets FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own assets"
  ON public.assets FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- GENERATION_JOBS: Users can read and create their own jobs
CREATE POLICY "Users can view own jobs"
  ON public.generation_jobs FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create jobs"
  ON public.generation_jobs FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Note: Users CANNOT update jobs directly - must go through Edge Functions
-- This prevents tampering with status, credits_reserved, etc.

-- JOB_EVENTS: Users can read events for their own jobs
CREATE POLICY "Users can view own job events"
  ON public.job_events FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.generation_jobs
      WHERE id = job_events.job_id AND user_id = auth.uid()
    )
  );

-- STRIPE_CUSTOMERS: Users can read their own Stripe link
CREATE POLICY "Users can view own stripe customer"
  ON public.stripe_customers FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- STRIPE_EVENTS: Server-only access (no policies for authenticated users)
-- Edge Functions use service_role key to bypass RLS

-- =============================================
-- ADMIN POLICIES
-- =============================================

CREATE POLICY "Admins can view all profiles"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can view all jobs"
  ON public.generation_jobs FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update all jobs"
  ON public.generation_jobs FOR UPDATE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can view all assets"
  ON public.assets FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can view all credit balances"
  ON public.credit_balances FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can view all ledger entries"
  ON public.credits_ledger FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));