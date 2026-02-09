import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

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

        // Get job_id from query params or body
        const url = new URL(req.url);
        let jobId = url.searchParams.get('job_id');

        if (!jobId && req.method === 'POST') {
            const body = await req.json();
            jobId = body.job_id;
        }

        if (!jobId) {
            return new Response(
                JSON.stringify({ error: 'job_id is required' }),
                { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
        }

        // Fetch job with RLS (user can only see their own jobs)
        const { data: job, error: jobError } = await supabase
            .from('generation_jobs')
            .select(`
        id,
        status,
        prompt,
        model_preset,
        cost_credits,
        attempts,
        queued_at,
        started_at,
        completed_at,
        error_message,
        output_asset_ids,
        created_at
      `)
            .eq('id', jobId)
            .eq('user_id', user.id)
            .single();

        if (jobError || !job) {
            return new Response(
                JSON.stringify({ error: 'Job not found' }),
                { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
        }

        // Get output signed URLs if job is completed
        let outputUrls: string[] = [];
        if (job.status === 'completed' && job.output_asset_ids?.length > 0) {
            const { data: assets } = await supabase
                .from('assets')
                .select('id, storage_path, bucket_name')
                .in('id', job.output_asset_ids)
                .eq('user_id', user.id);

            if (assets) {
                for (const asset of assets) {
                    const { data: signedUrl } = await supabase.storage
                        .from(asset.bucket_name)
                        .createSignedUrl(asset.storage_path, 3600); // 1 hour expiry

                    if (signedUrl?.signedUrl) {
                        outputUrls.push(signedUrl.signedUrl);
                    }
                }
            }
        }

        // Calculate progress estimate
        let progress = 0;
        switch (job.status) {
            case 'pending':
                progress = 0;
                break;
            case 'queued':
                progress = 10;
                break;
            case 'processing':
                // Estimate based on elapsed time (assume 30s average)
                const elapsed = Date.now() - new Date(job.started_at || job.queued_at).getTime();
                progress = Math.min(90, 10 + Math.floor(elapsed / 300)); // ~30s = 100%
                break;
            case 'completed':
                progress = 100;
                break;
            case 'failed':
            case 'cancelled':
                progress = 0;
                break;
        }

        return new Response(
            JSON.stringify({
                job_id: job.id,
                status: job.status,
                progress,
                prompt: job.prompt,
                model_preset: job.model_preset,
                cost_credits: job.cost_credits,
                attempts: job.attempts,
                queued_at: job.queued_at,
                started_at: job.started_at,
                completed_at: job.completed_at,
                error_message: job.error_message,
                output_urls: outputUrls,
                created_at: job.created_at,
            }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
    } catch (error: unknown) {
        console.error('Error getting job status:', error);
        const message = error instanceof Error ? error.message : 'Unknown error';
        return new Response(
            JSON.stringify({ error: message }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
    }
});
