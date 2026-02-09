import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Worker configuration
const WORKER_ID = `worker_${crypto.randomUUID().substring(0, 8)}`;
const BATCH_SIZE = 1; // Process one job at a time

// Timing-safe string comparison to prevent timing attacks
function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) {
    return false;
  }
  let result = 0;
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return result === 0;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Verify internal API key for cron/scheduler calls
    const apiKey = req.headers.get('x-api-key');
    const expectedKey = Deno.env.get('WORKER_API_KEY');
    
    // Require API key if configured - use timing-safe comparison
    if (expectedKey) {
      if (!apiKey || !timingSafeEqual(apiKey, expectedKey)) {
        return new Response(
          JSON.stringify({ error: 'Unauthorized' }),
          { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    console.log('Worker polling for jobs');

    // Fetch and lock a queued job using FOR UPDATE SKIP LOCKED pattern
    const { data: jobs, error: fetchError } = await supabase
      .from('generation_jobs')
      .select('*')
      .eq('status', 'queued')
      .order('queued_at', { ascending: true })
      .limit(BATCH_SIZE);

    if (fetchError) {
      throw fetchError;
    }

    if (!jobs || jobs.length === 0) {
      console.log('No queued jobs found');
      return new Response(
        JSON.stringify({ message: 'No jobs to process' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const job = jobs[0];
    console.log('Processing job', { attempt: job.attempts + 1 });

    // Update job to processing status
    const { error: updateError } = await supabase
      .from('generation_jobs')
      .update({
        status: 'processing',
        started_at: new Date().toISOString(),
        worker_id: WORKER_ID,
        attempts: job.attempts + 1,
      })
      .eq('id', job.id)
      .eq('status', 'queued'); // Optimistic locking

    if (updateError) {
      console.error('Failed to claim job');
      return new Response(
        JSON.stringify({ error: 'Failed to claim job' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Log processing start
    await supabase.from('job_events').insert({
      job_id: job.id,
      event_type: 'picked_up',
      details: { attempt: job.attempts + 1 },
    });

    try {
      // Get input asset if exists
      let inputUrl: string | null = null;
      if (job.input_asset_id) {
        const { data: asset } = await supabase
          .from('assets')
          .select('storage_path, bucket_name')
          .eq('id', job.input_asset_id)
          .single();

        if (asset) {
          // Generate signed URL for AI provider
          const { data: signedUrl } = await supabase.storage
            .from(asset.bucket_name)
            .createSignedUrl(asset.storage_path, 3600); // 1 hour
          inputUrl = signedUrl?.signedUrl ?? null;
        }
      }

      // ===========================================
      // AI GENERATION - Replace with your provider
      // ===========================================
      
      console.log('Generating with params', {
        promptLength: job.prompt?.length || 0,
        model_preset: job.model_preset,
        hasInput: !!inputUrl,
      });

      // Simulate AI generation (replace with actual API call)
      const generatedImageUrl = 'https://placehold.co/1024x1024/1a1a2e/ffffff?text=AI+Generated';
      
      // Simulate processing time
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Upload generated output to storage
      const outputPath = `${job.user_id}/${job.id}/output_${Date.now()}.png`;

      // Create output asset record
      const { data: outputAsset, error: assetError } = await supabase
        .from('assets')
        .insert({
          user_id: job.user_id,
          job_id: job.id,
          asset_type: 'generated',
          storage_path: outputPath,
          bucket_name: 'outputs',
          file_name: `output_${job.id}.png`,
          metadata: {
            model_preset: job.model_preset,
          },
        })
        .select()
        .single();

      if (assetError) {
        throw assetError;
      }

      // Update job as completed
      await supabase
        .from('generation_jobs')
        .update({
          status: 'completed',
          completed_at: new Date().toISOString(),
          output_asset_ids: [outputAsset.id],
          provider: 'placeholder', // Replace with actual provider
        })
        .eq('id', job.id);

      // Log completion
      await supabase.from('job_events').insert({
        job_id: job.id,
        event_type: 'completed',
        details: { 
          duration_ms: Date.now() - new Date(job.started_at || job.queued_at).getTime(),
        },
      });

      console.log('Job completed successfully');

      return new Response(
        JSON.stringify({
          status: 'completed',
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );

    } catch (processingError: unknown) {
      console.error('Job processing failed');

      // Check if should retry
      const shouldRetry = job.attempts < job.max_attempts;

      if (shouldRetry) {
        // Requeue job
        await supabase
          .from('generation_jobs')
          .update({
            status: 'queued',
            error_message: 'Processing failed - will retry',
          })
          .eq('id', job.id);

        await supabase.from('job_events').insert({
          job_id: job.id,
          event_type: 'retry',
          details: { 
            attempt: job.attempts + 1,
            max_attempts: job.max_attempts,
          },
        });
      } else {
        // Mark as failed and refund credits
        await supabase
          .from('generation_jobs')
          .update({
            status: 'failed',
            completed_at: new Date().toISOString(),
            error_message: 'Maximum attempts reached',
          })
          .eq('id', job.id);

        // Refund credits
        const { data: balance } = await supabase
          .from('credit_balances')
          .select('balance')
          .eq('user_id', job.user_id)
          .single();

        const newBalance = (balance?.balance || 0) + job.cost_credits;

        await supabase.from('credits_ledger').insert({
          user_id: job.user_id,
          tx_type: 'refund',
          amount: job.cost_credits,
          balance_after: newBalance,
          job_id: job.id,
          idempotency_key: `job_fail_refund_${job.id}`,
          description: `Job failed after ${job.max_attempts} attempts - refund`,
        });

        await supabase.from('job_events').insert({
          job_id: job.id,
          event_type: 'failed',
          details: { 
            refunded_credits: job.cost_credits,
          },
        });

        console.log('Job failed permanently, credits refunded');
      }

      return new Response(
        JSON.stringify({ 
          status: shouldRetry ? 'requeued' : 'failed',
        }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
  } catch (error: unknown) {
    console.error('Worker error');
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});