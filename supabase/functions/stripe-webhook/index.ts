import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import Stripe from "https://esm.sh/stripe@14.21.0?target=deno";

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, stripe-signature',
};

serve(async (req) => {
    if (req.method === 'OPTIONS') {
        return new Response(null, { headers: corsHeaders });
    }

    try {
        const stripeKey = Deno.env.get('STRIPE_SECRET_KEY');
        const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET');

        if (!stripeKey || !webhookSecret) {
            throw new Error('Stripe configuration missing');
        }

        const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
        const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
        const supabase = createClient(supabaseUrl, supabaseServiceKey);

        const stripe = new Stripe(stripeKey, { apiVersion: '2023-10-16' });
        const signature = req.headers.get('stripe-signature')!;
        const body = await req.text();

        // Verify webhook signature
        let event: Stripe.Event;
        try {
            event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
        } catch (err: unknown) {
            console.error('Webhook signature verification failed');
            return new Response(
                JSON.stringify({ error: 'Invalid signature' }),
                { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
        }

        console.log('Received Stripe webhook', { type: event.type });

        // Idempotency check - have we processed this event already?
        const { data: existingEvent } = await supabase
            .from('stripe_events')
            .select('id, processed')
            .eq('stripe_event_id', event.id)
            .single();

        if (existingEvent?.processed) {
            console.log('Event already processed');
            return new Response(
                JSON.stringify({ received: true, already_processed: true }),
                { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
        }

        // Store event for idempotency
        if (!existingEvent) {
            await supabase.from('stripe_events').insert({
                stripe_event_id: event.id,
                event_type: event.type,
                payload: event,
            });
        }

        // Handle checkout.session.completed
        if (event.type === 'checkout.session.completed') {
            const session = event.data.object as Stripe.Checkout.Session;

            if (session.payment_status === 'paid') {
                const userId = session.metadata?.user_id;
                const credits = parseInt(session.metadata?.credits || '0', 10);
                const packId = session.metadata?.pack_id;

                if (!userId || credits <= 0) {
                    console.error('Invalid session metadata');
                    throw new Error('Invalid session metadata');
                }

                console.log('Processing payment', { credits, pack: packId });

                // Get current balance
                const { data: currentBalance } = await supabase
                    .from('credit_balances')
                    .select('balance')
                    .eq('user_id', userId)
                    .single();

                const oldBalance = currentBalance?.balance || 0;
                const newBalance = oldBalance + credits;

                // Insert credit ledger entry
                const { error: ledgerError } = await supabase
                    .from('credits_ledger')
                    .insert({
                        user_id: userId,
                        tx_type: 'purchase',
                        amount: credits,
                        balance_after: newBalance,
                        stripe_event_id: event.id,
                        idempotency_key: `stripe_${event.id}`,
                        description: `Purchased ${packId}: +${credits} credits`,
                    });

                if (ledgerError) {
                    // Check if it's a duplicate key error (idempotency)
                    if (ledgerError.code === '23505') {
                        console.log('Credit already recorded (idempotency)');
                    } else {
                        throw ledgerError;
                    }
                } else {
                    console.log('Credits added successfully', { credits });
                }
            }
        }

        // Mark event as processed
        await supabase
            .from('stripe_events')
            .update({ processed: true, processed_at: new Date().toISOString() })
            .eq('stripe_event_id', event.id);

        return new Response(
            JSON.stringify({ received: true }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
    } catch (error: unknown) {
        console.error('Webhook error');
        return new Response(
            JSON.stringify({ error: 'Internal server error' }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
    }
});