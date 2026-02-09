# AI Image Generation Platform - Supabase Setup

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────────┐
│                              CLIENT (React SPA)                          │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐       │
│  │   Auth   │ │  Upload  │ │  Create  │ │  Poll    │ │   Buy    │       │
│  │   UI     │ │  Images  │ │   Job    │ │  Status  │ │ Credits  │       │
│  └────┬─────┘ └────┬─────┘ └────┬─────┘ └────┬─────┘ └────┬─────┘       │
└───────┼────────────┼────────────┼────────────┼────────────┼─────────────┘
        │            │            │            │            │
        ▼            ▼            ▼            ▼            ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                           SUPABASE CLOUD                                 │
│                                                                          │
│  ┌─────────────────┐    ┌──────────────────────────────────────────┐    │
│  │   AUTH SERVICE  │    │              EDGE FUNCTIONS               │    │
│  │  ├─ Email/Pass  │    │  ├─ create-checkout-session              │    │
│  │  └─ Google OAuth│    │  ├─ stripe-webhook                       │    │
│  └────────┬────────┘    │  ├─ create-generation-job                │    │
│           │             │  ├─ process-generation-job (worker)       │    │
│           │             │  └─ get-job-status                        │    │
│           │             └──────────────────┬───────────────────────┘    │
│           │                                │                             │
│           ▼                                ▼                             │
│  ┌─────────────────────────────────────────────────────────────────┐    │
│  │                        POSTGRESQL DATABASE                       │    │
│  │  ┌──────────┐ ┌───────────────┐ ┌────────────────┐              │    │
│  │  │ profiles │ │ credit_balances│ │ generation_jobs│              │    │
│  │  └──────────┘ └───────────────┘ └────────────────┘              │    │
│  │  ┌──────────┐ ┌───────────────┐ ┌────────────────┐              │    │
│  │  │  assets  │ │ credits_ledger │ │   job_events   │              │    │
│  │  └──────────┘ └───────────────┘ └────────────────┘              │    │
│  │  ┌───────────────┐ ┌───────────────┐ ┌──────────────┐           │    │
│  │  │ stripe_customers│ │ stripe_events │ │  user_roles  │           │    │
│  │  └───────────────┘ └───────────────┘ └──────────────┘           │    │
│  └─────────────────────────────────────────────────────────────────┘    │
│                                                                          │
│  ┌─────────────────────────────────────────────────────────────────┐    │
│  │                        STORAGE BUCKETS                           │    │
│  │  ┌────────────────────────┐  ┌────────────────────────┐         │    │
│  │  │  uploads (private)     │  │  outputs (private)      │         │    │
│  │  │  /{user_id}/{file}     │  │  /{user_id}/{job_id}/   │         │    │
│  │  └────────────────────────┘  └────────────────────────┘         │    │
│  └─────────────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
        ┌───────────────────────────┼───────────────────────────┐
        │                           │                           │
        ▼                           ▼                           ▼
┌───────────────┐         ┌───────────────┐         ┌───────────────┐
│  STRIPE API   │         │  AI PROVIDER  │         │  GPU WORKERS  │
│  - Checkout   │         │  - Replicate  │         │  - Modal      │
│  - Webhooks   │         │  - FAL.ai     │         │  - RunPod     │
│  - Customers  │         │  - Lovable AI │         │  - Custom     │
└───────────────┘         └───────────────┘         └───────────────┘
```

## Primary Flows

### 1. Signup/Login
1. User signs up via email/password or Google OAuth
2. `handle_new_user()` trigger creates profile, assigns role, grants 10 welcome credits
3. Session token returned to client

### 2. Upload Product Image
1. Client uploads to `uploads/{user_id}/{filename}` via Storage API
2. Client creates asset record in `assets` table
3. Asset ready for use in generation jobs

### 3. Create Generation Job
1. Client calls `create-generation-job` edge function
2. Function validates credit balance
3. Reserves credits atomically (ledger entry)
4. Creates job with status `queued`
5. Returns job_id to client

### 4. Process Generation Job (Worker)
1. Worker polls for `queued` jobs
2. Claims job (status → `processing`)
3. Fetches input asset signed URL
4. Calls AI provider
5. Stores output in `outputs` bucket
6. Updates job to `completed`
7. On failure: retries or refunds credits

### 5. Deliver Results
1. Client polls `get-job-status` or uses realtime subscription
2. On completion, receives signed URLs for outputs

### 6. Buy Credits
1. Client calls `create-checkout-session` with pack_id
2. Function creates/gets Stripe customer
3. Returns Stripe Checkout URL
4. After payment, webhook credits account

---

## Database Schema

### Tables

| Table | Purpose |
|-------|---------|
| `profiles` | User profile linked to auth.users |
| `user_roles` | Role assignments (security) |
| `credit_balances` | Current credit balance (derived) |
| `credits_ledger` | Append-only credit transactions |
| `assets` | Uploaded and generated files |
| `generation_jobs` | AI generation job queue |
| `job_events` | Audit trail for jobs |
| `stripe_customers` | User → Stripe customer mapping |
| `stripe_events` | Webhook idempotency tracking |

### Key Enums

```sql
-- Job status state machine
CREATE TYPE job_status AS ENUM (
  'pending', 'queued', 'processing', 
  'completed', 'failed', 'cancelled'
);

-- Credit transaction types
CREATE TYPE credit_tx_type AS ENUM (
  'purchase', 'spend', 'refund', 
  'bonus', 'adjustment'
);
```

---

## Row Level Security

### Client-Accessible Tables

| Table | SELECT | INSERT | UPDATE | DELETE |
|-------|--------|--------|--------|--------|
| profiles | Own | ❌ | Own | ❌ |
| user_roles | Own | ❌ | ❌ | ❌ |
| credit_balances | Own | ❌ | ❌ | ❌ |
| credits_ledger | Own | ❌ | ❌ | ❌ |
| assets | Own | Own | Own | Own |
| generation_jobs | Own | Own | ❌ | ❌ |
| job_events | Own jobs | ❌ | ❌ | ❌ |
| stripe_customers | Own | ❌ | ❌ | ❌ |
| stripe_events | ❌ | ❌ | ❌ | ❌ |

### Server-Only Operations (via Edge Functions)

- **credits_ledger INSERT**: Only edge functions can add entries
- **generation_jobs UPDATE**: Status/results controlled by worker
- **stripe_events ALL**: Webhook processing only

---

## Auth Configuration

| Setting | Value | Reason |
|---------|-------|--------|
| Email/Password | Enabled | Primary auth method |
| Auto-confirm email | Enabled | Faster onboarding for MVP |
| Google OAuth | Ready | Configure in Cloud dashboard |
| Anonymous users | Disabled | Prevent abuse |

### Session Handling (Client)

```typescript
// Initialize auth state
useEffect(() => {
  const { data: { subscription } } = supabase.auth.onAuthStateChange(
    (event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
    }
  );

  supabase.auth.getSession().then(({ data: { session } }) => {
    setSession(session);
    setUser(session?.user ?? null);
  });

  return () => subscription.unsubscribe();
}, []);
```

---

## Storage Buckets

### uploads (Private)
- **Purpose**: User-uploaded product images
- **Path**: `{user_id}/{filename}`
- **Max size**: 10MB
- **MIME types**: image/jpeg, image/png, image/webp, image/gif
- **Access**: User can CRUD their own files

### outputs (Private)
- **Purpose**: AI-generated results
- **Path**: `{user_id}/{job_id}/{filename}`
- **Max size**: 50MB (for videos)
- **MIME types**: image/*, video/mp4, video/webm
- **Access**: User can read; only server can write

### Signed URL Strategy

```typescript
// Generate signed URL (valid 1 hour)
const { data } = await supabase.storage
  .from('outputs')
  .createSignedUrl(path, 3600);
```

---

## Edge Functions

### 1. create-checkout-session
- **Route**: POST /create-checkout-session
- **Auth**: Required (JWT)
- **Input**: `{ pack_id, success_url?, cancel_url? }`
- **Output**: `{ checkout_url, session_id }`
- **Env vars**: `STRIPE_SECRET_KEY`

### 2. stripe-webhook
- **Route**: POST /stripe-webhook
- **Auth**: None (signature verified)
- **Input**: Stripe event payload
- **Output**: `{ received: true }`
- **Env vars**: `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`

### 3. create-generation-job
- **Route**: POST /create-generation-job
- **Auth**: Required (JWT)
- **Input**: 
```json
{
  "input_asset_id": "uuid",
  "prompt": "string",
  "model_preset": "fashion_model_v1",
  "pose_preset": "standing",
  "scene_preset": "studio",
  "generation_type": "standard"
}
```
- **Output**: `{ job_id, status, cost_credits, remaining_credits }`

### 4. process-generation-job (Worker)
- **Route**: POST /process-generation-job
- **Auth**: Optional API key
- **Trigger**: Cron/scheduler or manual
- **Action**: Processes queued jobs

### 5. get-job-status
- **Route**: GET/POST /get-job-status?job_id=xxx
- **Auth**: Required (JWT)
- **Output**: Job status + signed output URLs

---

## Credit Accounting

### Strategy: Reserve on Create

Credits are deducted **when the job is created**, not when completed.

**Rationale**:
- Prevents race conditions
- User sees immediate balance update
- Failed jobs get refunded

### Atomic Spend Pattern

```sql
-- Idempotent credit spend
INSERT INTO credits_ledger (
  user_id, tx_type, amount, balance_after, 
  job_id, idempotency_key, description
) VALUES (
  $1, 'spend', -$2, $3, 
  $4, 'job_reserve_' || $4, 'Generation job'
);
```

### Refund on Failure

```sql
-- Refund after max retries
INSERT INTO credits_ledger (
  user_id, tx_type, amount, balance_after,
  job_id, idempotency_key, description
) VALUES (
  $1, 'refund', $2, $3,
  $4, 'job_fail_refund_' || $4, 'Job failed - refund'
);
```

---

## Secrets Required

| Secret | Purpose | Used By |
|--------|---------|---------|
| `STRIPE_SECRET_KEY` | Stripe API calls | create-checkout-session, stripe-webhook |
| `STRIPE_WEBHOOK_SECRET` | Verify webhook signatures | stripe-webhook |
| `WORKER_API_KEY` | (Optional) Secure worker endpoint | process-generation-job |
| `AI_PROVIDER_KEY` | AI generation API | process-generation-job |

---

## Observability

### Logging Pattern

```typescript
console.log('Creating job:', { 
  user_id: user.id, 
  job_id, 
  cost: costCredits 
});
```

### Admin Queries

```sql
-- Jobs by status
SELECT status, COUNT(*) FROM generation_jobs GROUP BY status;

-- Credit purchases today
SELECT SUM(amount) FROM credits_ledger 
WHERE tx_type = 'purchase' AND created_at > now() - interval '1 day';

-- Failed jobs needing attention
SELECT * FROM generation_jobs 
WHERE status = 'failed' AND created_at > now() - interval '7 days';
```

### Cleanup

```sql
-- Delete old temp assets (run weekly)
DELETE FROM assets 
WHERE created_at < now() - interval '30 days' 
AND job_id IS NULL;

-- Archive old job events (run monthly)
DELETE FROM job_events 
WHERE created_at < now() - interval '90 days';
```

---

## Rate Limiting

Implement via database check:

```sql
-- Check rate limit (10 jobs per hour)
SELECT COUNT(*) FROM generation_jobs
WHERE user_id = $1 
AND created_at > now() - interval '1 hour';
```

---

## File Structure

```
supabase/
├── config.toml
└── functions/
    ├── create-checkout-session/
    │   └── index.ts
    ├── stripe-webhook/
    │   └── index.ts
    ├── create-generation-job/
    │   └── index.ts
    ├── process-generation-job/
    │   └── index.ts
    └── get-job-status/
        └── index.ts
```

---

## Google OAuth Setup

To enable Google OAuth, configure in the Lovable Cloud dashboard:

<presentation-actions>
  <presentation-open-backend>View Backend</presentation-open-backend>
</presentation-actions>

Then navigate to **Users → Auth Settings → Google Settings** and add:
- Google Client ID
- Google Client Secret

Configure in Google Cloud Console:
1. Create OAuth 2.0 credentials
2. Add authorized redirect URL: `https://{project-id}.supabase.co/auth/v1/callback`
3. Add your app's origin to authorized JavaScript origins
