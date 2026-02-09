import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Cost per generation type
const GENERATION_COSTS: Record<string, number> = {
    'standard': 10,
    'high_quality': 20,
    'video': 50,
};

// Validation constants
const MAX_PROMPT_LENGTH = 1000;
const MAX_NEGATIVE_PROMPT_LENGTH = 1000;
const VALID_GENERATION_TYPES = ['standard', 'high_quality', 'video'];
const VALID_MODEL_PRESETS = ['fashion_model_v1', 'fashion_female', 'fashion_male'];

serve(async (req) => {
    if (req.method === 'OPTIONS') {
        return new Response(null, { headers: corsHeaders });
    }

    try {
        const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
        const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

        // Get user from auth header
        const authHeader = req.headers.get('Authorization')!;
        const supabase = createClient(supabaseUrl, supabaseServiceKey);

        const token = authHeader.replace('Bearer ', '');
        const { data: { user }, error: userError } = await supabase.auth.getUser(token);

        if (userError || !user) {
            return new Response(
                JSON.stringify({ error: 'Unauthorized' }),
                { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
        }

        // Parse request body
        const {
            input_asset_id,
            prompt,
            negative_prompt,
            model_preset = 'fashion_model_v1',
            pose_preset,
            scene_preset,
            generation_type = 'standard',
            params = {},
        } = await req.json();

        // === Input Validation ===

        // Validate prompt is provided and not empty
        if (!prompt || typeof prompt !== 'string' || prompt.trim().length === 0) {
            return new Response(
                JSON.stringify({ error: 'Prompt is required' }),
                { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
        }

        // Validate prompt length
        if (prompt.length > MAX_PROMPT_LENGTH) {
            return new Response(
                JSON.stringify({ error: `Prompt too long (max ${MAX_PROMPT_LENGTH} characters)` }),
                { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
        }

        // Validate negative_prompt length if provided
        if (negative_prompt && typeof negative_prompt === 'string' && negative_prompt.length > MAX_NEGATIVE_PROMPT_LENGTH) {
            return new Response(
                JSON.stringify({ error: `Negative prompt too long (max ${MAX_NEGATIVE_PROMPT_LENGTH} characters)` }),
                { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
        }

        // Validate generation_type
        if (!VALID_GENERATION_TYPES.includes(generation_type)) {
            return new Response(
                JSON.stringify({ error: 'Invalid generation type', valid_types: VALID_GENERATION_TYPES }),
                { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
        }

        // Validate model_preset
        if (model_preset && !VALID_MODEL_PRESETS.includes(model_preset)) {
            return new Response(
                JSON.stringify({ error: 'Invalid model preset', valid_presets: VALID_MODEL_PRESETS }),
                { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
        }

        // Validate input asset exists and belongs to user
        if (input_asset_id) {
            const { data: asset, error: assetError } = await supabase
                .from('assets')
                .select('id, user_id')
                .eq('id', input_asset_id)
                .single();

            if (assetError || !asset || asset.user_id !== user.id) {
                return new Response(
                    JSON.stringify({ error: 'Invalid input asset' }),
                    { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
                );
            }
        }

        const costCredits = GENERATION_COSTS[generation_type] || 10;

        // Create job ID upfront for idempotency key
        const jobId = crypto.randomUUID();
        const idempotencyKey = `job_reserve_${jobId}`;

        // Reserve credits atomically using database function (prevents race conditions)
        const { data: reservationResult, error: reserveError } = await supabase
            .rpc('reserve_credits_atomic', {
                user_id_param: user.id,
                amount_param: costCredits,
                job_id_param: jobId,
                idempotency_key_param: idempotencyKey,
                description_param: `Generation job: ${generation_type}`,
            });

        if (reserveError) {
            console.error('Credit reservation error');
            return new Response(
                JSON.stringify({ error: 'Failed to reserve credits' }),
                { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
        }

        const reservation = reservationResult?.[0];
        if (!reservation?.success) {
            const errorMsg = reservation?.error_msg || 'Failed to reserve credits';
            const statusCode = errorMsg === 'Insufficient credits' ? 402 : 400;
            return new Response(
                JSON.stringify({
                    error: errorMsg,
                    required: costCredits,
                    available: reservation?.new_balance || 0,
                }),
                { status: statusCode, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
        }

        const newBalance = reservation.new_balance;

        // Create the generation job
        const { data: job, error: jobError } = await supabase
            .from('generation_jobs')
            .insert({
                id: jobId,
                user_id: user.id,
                status: 'queued',
                input_asset_id,
                prompt: prompt.trim(),
                negative_prompt: negative_prompt?.trim() || null,
                model_preset,
                pose_preset,
                scene_preset,
                params,
                cost_credits: costCredits,
                credits_reserved: true,
                queued_at: new Date().toISOString(),
            })
            .select()
            .single();

        if (jobError) {
            console.error('Failed to create job');
            // Attempt to refund credits atomically
            await supabase.rpc('release_credits_atomic', {
                user_id_param: user.id,
                amount_param: costCredits,
                job_id_param: jobId,
                idempotency_key_param: `job_refund_create_fail_${jobId}`,
                description_param: 'Job creation failed - refund',
            });

            return new Response(
                JSON.stringify({ error: 'Failed to create job' }),
                { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
        }

        // Log job creation event
        await supabase.from('job_events').insert({
            job_id: jobId,
            event_type: 'created',
            details: { generation_type, cost_credits: costCredits },
        });

        console.log('Job created', { promptLength: prompt.length, cost: costCredits });

        return new Response(
            JSON.stringify({
                job_id: jobId,
                status: 'queued',
                cost_credits: costCredits,
                remaining_credits: newBalance,
            }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
    } catch (error: unknown) {
        console.error('Error creating job');
        return new Response(
            JSON.stringify({ error: 'Internal server error' }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
    }
});