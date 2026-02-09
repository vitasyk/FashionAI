# Provamoda Clone Blueprint
## AI Fashion Photography Platform - Complete Build Specification

---

## 1. EXECUTIVE SUMMARY

**Product:** AI-powered fashion photography platform that transforms product flat-lay images into professional model photoshoots.

**Core Value Proposition:** Replace expensive traditional photoshoots with AI-generated, campaign-ready fashion imagery in minutes.

**Key Features:**
- Upload garment → Generate model wearing it with customizable pose/scene/model type
- Virtual try-on with garment preservation accuracy
- Prompt-based image editing
- Video generation from stills ("Motion Engine")
- Background removal & upscaling
- Multi-model support per image

**Business Model:** Credit-based consumption with tiered packages ($35/140 credits → $450/2300 credits)

---

## 2. OBSERVED PRODUCT SURFACE

### 2.1 Site Map

| Page | Purpose |
|------|---------|
| `/` | Hero landing, value prop, how it works, features, testimonials, CTA |
| `/examples` | Gallery of generated fashion photos |
| `/styles` | Photography guides/tutorials (SEO content) |
| `/pricing` | Credit packages with feature comparison |
| `/blog` | Content marketing |
| `/login` | User authentication |
| `/signup` | New user registration |
| `/app/*` | Protected app dashboard (inferred) |

### 2.2 Core User Journeys

**Journey 1: Visitor → Customer**
```
Landing → Examples Gallery → Pricing → Signup → Dashboard
```

**Journey 2: Photo Generation**
```
Upload flat-lay → Select model (gender, ethnicity, body type)
→ Choose pose preset → Select background/scene
→ Generate → Review results → Export high-res
```

**Journey 3: Video Generation**
```
Select existing generated photo → Enter motion prompt
→ Generate video → Export (9:16 vertical for social)
```

**Journey 4: Prompt Editing**
```
Select generated image → Enter text prompt ("make sleeves shorter")
→ Generate variation → Compare → Export
```

---

## 3. TECH FINGERPRINTING TABLE

| Category | Evidence | Best Guess | Confidence | Alternatives |
|----------|----------|------------|------------|--------------|
| **Frontend** | `/_next/` URLs, React hydration | Next.js 14 (App Router) | HIGH | - |
| **Styling** | Tailwind classes in source | Tailwind CSS | HIGH | - |
| **Auth** | Supabase storage URLs visible | Supabase Auth | HIGH | Clerk, Auth0 |
| **Database** | `hoirqrkdgbmvpwutwuwj.supabase.co` | Supabase Postgres | HIGH | - |
| **Storage** | Supabase storage bucket URLs | Supabase Storage + S3 | HIGH | R2, GCS |
| **Payments** | Standard checkout flow | Stripe | MED | Paddle, LemonSqueezy |
| **Hosting** | Response headers, speed | Vercel | HIGH | Cloudflare |
| **CDN** | `_next/image` optimization | Vercel Edge/Image | HIGH | Cloudinary |
| **Analytics** | Common patterns | PostHog or GA4 | MED | Segment, Mixpanel |
| **AI/ML** | Complex generations | Custom diffusion pipeline | MED | Replicate, Modal |

---

## 4. RECOMMENDED CLONE ARCHITECTURES

### 4.1 MVP Architecture (4-6 weeks, $500-2K/mo infra)

```
┌─────────────────────────────────────────────────────────┐
│                    FRONTEND (Vercel)                     │
│  Next.js 14 / React 18 / Tailwind / shadcn/ui           │
└─────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────┐
│                LOVABLE CLOUD (SUPABASE)                  │
│  ┌──────────┐ ┌──────────┐ ┌──────────────┐            │
│  │   Auth   │ │ Postgres │ │   Storage    │            │
│  │  (Email) │ │  (Data)  │ │  (Uploads)   │            │
│  └──────────┘ └──────────┘ └──────────────┘            │
│  ┌────────────────────────────────────────┐            │
│  │         Edge Functions (API)           │            │
│  └────────────────────────────────────────┘            │
└─────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────┐
│              AI SERVICES (API-First)                     │
│  ┌──────────────┐ ┌──────────────┐ ┌────────────────┐  │
│  │  Replicate   │ │  FAL.ai      │ │  Lovable AI    │  │
│  │ (Diffusion)  │ │ (Fast SDXL)  │ │ (Text/Vision)  │  │
│  └──────────────┘ └──────────────┘ └────────────────┘  │
│  ┌──────────────┐ ┌──────────────┐                      │
│  │ Remove.bg   │ │  Upscale API │                      │
│  │ (BG Remove) │ │  (Super-res) │                      │
│  └──────────────┘ └──────────────┘                      │
└─────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────┐
│                   PAYMENTS (Stripe)                      │
│  One-time credit packages / Webhook handling            │
└─────────────────────────────────────────────────────────┘
```

**MVP Tech Stack:**
- Frontend: React/Vite + Tailwind + shadcn/ui (current Lovable stack)
- Backend: Lovable Cloud (Supabase)
- AI: Replicate (SDXL + ControlNet) or FAL.ai
- Payments: Stripe Checkout
- Storage: Supabase Storage

### 4.2 Scalable Production Architecture

```
┌─────────────────────────────────────────────────────────┐
│                 EDGE NETWORK (Cloudflare)                │
│  CDN / DDoS Protection / WAF / Image Optimization       │
└─────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────┐
│              WEB APP (Vercel / Cloudflare Pages)         │
│  Next.js 14 / RSC / Streaming / Edge Middleware         │
└─────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────┐
│                    API LAYER                             │
│  ┌─────────────────────┐  ┌─────────────────────┐       │
│  │  Supabase Edge Fns  │  │  Dedicated Workers  │       │
│  │  (Auth, CRUD, Jobs) │  │  (Heavy Processing) │       │
│  └─────────────────────┘  └─────────────────────┘       │
└─────────────────────────────────────────────────────────┘
                              │
              ┌───────────────┼───────────────┐
              ▼               ▼               ▼
┌───────────────────┐ ┌─────────────┐ ┌─────────────────┐
│   PostgreSQL      │ │    Redis    │ │  Object Storage │
│   (Supabase)      │ │   (Queue)   │ │  (S3/R2)        │
└───────────────────┘ └─────────────┘ └─────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────┐
│                 GPU WORKERS (Modal/RunPod)               │
│  ┌──────────────┐ ┌──────────────┐ ┌────────────────┐  │
│  │ Segmentation │ │  Diffusion   │ │   Video Gen    │  │
│  │ (SAM/RMBG)   │ │ (SDXL+CN)    │ │ (Stable Video) │  │
│  └──────────────┘ └──────────────┘ └────────────────┘  │
│  ┌──────────────┐ ┌──────────────┐                      │
│  │  Upscaling   │ │  Post-proc   │                      │
│  │  (RealESRGAN)│ │  (Cleanup)   │                      │
│  └──────────────┘ └──────────────┘                      │
└─────────────────────────────────────────────────────────┘
```

---

## 5. BACKEND/API SPEC

### 5.1 Authentication Endpoints

```yaml
POST /auth/signup
  body: { email, password }
  response: { user, session }

POST /auth/login
  body: { email, password }
  response: { user, session }

POST /auth/oauth/google
  response: redirect to OAuth flow

POST /auth/logout
  response: { success: true }
```

### 5.2 User & Credits Endpoints

```yaml
GET /api/me
  auth: required
  response: { id, email, credits, plan, created_at }

GET /api/credits
  auth: required
  response: { balance, history: [{ type, amount, created_at }] }
```

### 5.3 Upload Endpoints

```yaml
POST /api/uploads/presign
  auth: required
  body: { filename, content_type }
  response: { upload_url, asset_id, public_url }

POST /api/uploads/complete
  auth: required
  body: { asset_id }
  response: { asset: { id, url, thumbnail_url } }
```

### 5.4 Generation Endpoints

```yaml
POST /api/jobs
  auth: required
  body: {
    type: "photo" | "video" | "edit",
    source_asset_id: string,
    config: {
      model_gender: "male" | "female",
      model_ethnicity: string,
      pose_id: string,
      background_id: string,
      prompt?: string
    }
  }
  response: { job_id, status: "pending", credits_held: 1 }

GET /api/jobs/:id
  auth: required
  response: {
    id, status: "pending"|"processing"|"completed"|"failed",
    result_url?: string,
    progress?: number,
    error?: string
  }

GET /api/jobs
  auth: required
  query: { page, limit, status }
  response: { jobs: [...], total, page }
```

### 5.5 Billing Endpoints

```yaml
POST /api/checkout
  auth: required
  body: { package_id: "basic"|"professional"|"enterprise" }
  response: { checkout_url: string }

POST /api/webhooks/stripe
  body: Stripe webhook event
  response: { received: true }
```

---

## 6. DATA MODEL

```sql
-- Users (handled by Supabase Auth, extended with profiles)
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  email TEXT,
  credits INTEGER DEFAULT 0,
  plan TEXT DEFAULT 'free',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Credit transactions
CREATE TABLE credits_ledger (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id),
  amount INTEGER NOT NULL,
  type TEXT NOT NULL, -- 'purchase', 'spend', 'refund'
  description TEXT,
  job_id UUID,
  payment_id TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Uploaded assets
CREATE TABLE assets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id),
  type TEXT NOT NULL, -- 'upload', 'generated', 'video'
  storage_path TEXT NOT NULL,
  public_url TEXT,
  thumbnail_url TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Generation jobs
CREATE TABLE jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id),
  source_asset_id UUID REFERENCES assets(id),
  result_asset_id UUID REFERENCES assets(id),
  type TEXT NOT NULL, -- 'photo', 'video', 'edit'
  status TEXT DEFAULT 'pending', -- 'pending', 'processing', 'completed', 'failed'
  config JSONB NOT NULL,
  credits_cost INTEGER DEFAULT 1,
  progress INTEGER DEFAULT 0,
  error TEXT,
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Model presets (poses, backgrounds, model types)
CREATE TABLE presets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category TEXT NOT NULL, -- 'pose', 'background', 'model'
  name TEXT NOT NULL,
  thumbnail_url TEXT,
  config JSONB NOT NULL,
  is_active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0
);

-- Payments
CREATE TABLE payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id),
  stripe_payment_id TEXT UNIQUE,
  package TEXT NOT NULL,
  amount_cents INTEGER NOT NULL,
  credits INTEGER NOT NULL,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT now()
);
```

---

## 7. AI/ML PIPELINE DESIGN

### 7.1 Pipeline Stages

```
┌─────────────┐    ┌──────────────┐    ┌───────────────┐
│   UPLOAD    │───▶│ PREPROCESSING│───▶│  GENERATION   │
│  (Garment)  │    │ (Segment/Mask)│    │ (Diffusion)   │
└─────────────┘    └──────────────┘    └───────────────┘
                                              │
                   ┌──────────────┐    ┌──────┴────────┐
                   │ POST-PROCESS │◀───│   COMPOSITE   │
                   │ (Upscale/QA) │    │ (Blend/Refine)│
                   └──────────────┘    └───────────────┘
```

### 7.2 Stage Details

| Stage | Purpose | MVP Solution | Production Solution | Latency | Cost/Image |
|-------|---------|--------------|---------------------|---------|------------|
| **Segmentation** | Extract garment mask | RMBG-2.0 API | Self-hosted SAM2 | 1-3s | $0.01 |
| **Conditioning** | Preserve garment details | IP-Adapter + ControlNet | Fine-tuned model | - | - |
| **Generation** | Create model + scene | Replicate SDXL | Modal A100 cluster | 10-30s | $0.02-0.05 |
| **Upscaling** | 1K→2K resolution | RealESRGAN API | Self-hosted | 3-5s | $0.01 |
| **Video** | Still→Motion | Kling/Runway API | Stable Video Diffusion | 30-60s | $0.10-0.50 |

### 7.3 Recommended Models

**MVP (API-First):**
- Segmentation: `briaai/RMBG-2.0` on Replicate
- Generation: `lucataco/sdxl-controlnet` with IP-Adapter
- Upscaling: `nightmareai/real-esrgan`
- Video: `kling-ai/kling-video` or `runway/gen3`

**Production (Self-Hosted):**
- Segmentation: SAM2 on Modal (A10G)
- Generation: Custom SDXL fine-tune + ControlNet stack on A100
- Upscaling: RealESRGAN-x4plus
- Video: Stable Video Diffusion on H100

---

## 8. INFRASTRUCTURE & DEVOPS

### 8.1 Infrastructure Diagram

```
                    ┌─────────────────────┐
                    │     Cloudflare      │
                    │   (CDN + Security)  │
                    └──────────┬──────────┘
                               │
        ┌──────────────────────┼──────────────────────┐
        │                      │                      │
        ▼                      ▼                      ▼
┌───────────────┐    ┌─────────────────┐    ┌─────────────────┐
│    Vercel     │    │  Supabase Edge  │    │   Modal/RunPod  │
│  (Frontend)   │    │   (API + DB)    │    │  (GPU Workers)  │
└───────────────┘    └────────┬────────┘    └────────┬────────┘
                              │                      │
                    ┌─────────┴─────────┐           │
                    │                   │           │
                    ▼                   ▼           │
             ┌───────────┐       ┌───────────┐     │
             │ Postgres  │       │  Storage  │◀────┘
             │ (Supabase)│       │  (S3/R2)  │
             └───────────┘       └───────────┘
```

### 8.2 Environment Strategy

| Environment | Purpose | Database | GPU | URL |
|-------------|---------|----------|-----|-----|
| Local | Development | Local Supabase | Mock/Replicate | localhost:5173 |
| Preview | PR reviews | Supabase branch | Replicate | pr-*.vercel.app |
| Staging | QA testing | Staging project | Modal staging | staging.app.com |
| Production | Live users | Production DB | Modal prod | app.com |

### 8.3 Cost Estimate (Monthly)

| Component | MVP | Production |
|-----------|-----|------------|
| Vercel | $0-20 | $100-300 |
| Supabase | $25 | $100-500 |
| GPU (Modal) | $100-500 | $2K-10K |
| Storage (R2) | $5-20 | $50-200 |
| Stripe fees | 2.9% + $0.30 | 2.9% + $0.30 |
| **Total** | **$150-600** | **$2.5K-11K** |

---

## 9. BUILD PLAN

### Phase 1: Foundation (Week 1-2)
- [ ] Set up Lovable project with design system
- [ ] Create landing page with all sections
- [ ] Implement authentication (email/password)
- [ ] Set up database schema
- [ ] Create basic dashboard layout

### Phase 2: Core Generation (Week 3-4)
- [ ] Implement file upload to storage
- [ ] Build generation job queue
- [ ] Integrate first AI model (Replicate SDXL)
- [ ] Create results gallery view
- [ ] Add credit consumption logic

### Phase 3: Payments & Polish (Week 5-6)
- [ ] Integrate Stripe checkout
- [ ] Implement credit packages
- [ ] Add prompt-based editing
- [ ] Build preset management (poses, backgrounds)
- [ ] Performance optimization

### Phase 4: Advanced Features (Week 7-8)
- [ ] Video generation
- [ ] Upscaling pipeline
- [ ] Batch processing
- [ ] Usage analytics dashboard
- [ ] Mobile responsiveness

### Team Roles
| Role | Responsibility | FTE |
|------|---------------|-----|
| Full-Stack Dev | Frontend + API + integrations | 1.0 |
| ML Engineer | Pipeline optimization, model selection | 0.5 |
| Designer | UI polish, asset creation | 0.25 |

### Risks & Mitigations
| Risk | Impact | Mitigation |
|------|--------|------------|
| AI quality inconsistent | High | A/B test multiple models, add retry logic |
| GPU costs spike | Medium | Implement rate limiting, queue management |
| Stripe integration issues | Medium | Use Stripe test mode extensively |
| Garment preservation poor | High | Multiple ControlNet conditions, IP-Adapter strength tuning |

---

## 10. UNKNOWNS & VERIFICATION CHECKLIST

| Unknown | How to Verify |
|---------|---------------|
| Exact diffusion model used | Test various SDXL + ControlNet combos |
| Video generation quality | Compare Kling vs Runway vs SVD outputs |
| Garment mask accuracy | Benchmark SAM2 vs RMBG vs proprietary |
| Auth provider details | Inspect network requests on login |
| Exact Stripe product IDs | Replicate pricing structure |
| Multi-model per image impl | Experiment with composition techniques |
| Background removal quality | A/B test RMBG, PhotoRoom, Remove.bg |

---

## CONCLUSION

This blueprint provides a complete roadmap to build a Provamoda-style AI fashion photography platform. The MVP can be shipped in 4-6 weeks using Lovable's stack with API-first AI services. Production scaling requires dedicated GPU infrastructure and optimization.

**Next Step:** Enable Lovable Cloud and begin implementing the landing page with the design system defined below.
