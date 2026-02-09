import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import Stripe from "https://esm.sh/stripe@14.21.0?target=deno";

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Credit packs configuration
const CREDIT_PACKS: Record<string, { credits: number, price_cents: number, name: string }> = {
    'pack_10': { credits: 10, price_cents: 999, name: '10 Credits' },
    'pack_50': { credits: 50, price_cents: 3999, name: '50 Credits' },
    'pack_100': { credits: 100, price_cents: 6999, name: '100 Credits' },
    'pack_500': { credits: 500, price_cents: 29999, name: '500 Credits' },
};

serve(async (req) => {
    // Handle CORS preflight
    if (req.method === 'OPTIONS') {
        return new Response(null, { headers: corsHeaders });
    }

    try {
        const stripeKey = Deno.env.get('STRIPE_SECRET_KEY');
        if (!stripeKey) {
            throw new Error('Stripe secret key not configured');
        }

        const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
        const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

        // Get user from auth header
        const authHeader = req.headers.get('Authorization')!;
        const supabase = createClient(supabaseUrl, supabaseServiceKey);

        const token = authHeader.replace('Bearer ', '');
        const { data: { user }, error: userError } = await supabase.auth.getUser(token);

        if (userError || !user) {
            console.error('Auth error');
            return new Response(
                JSON.stringify({ error: 'Unauthorized' }),
                { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
        }

        // Parse request body
        const { pack_id, success_url, cancel_url } = await req.json();

        if (!pack_id || !CREDIT_PACKS[pack_id]) {
            return new Response(
                JSON.stringify({ error: 'Invalid pack_id', valid_packs: Object.keys(CREDIT_PACKS) }),
                { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
        }

        const pack = CREDIT_PACKS[pack_id];
        const stripe = new Stripe(stripeKey, { apiVersion: '2023-10-16' });

        // Get or create Stripe customer
        let stripeCustomerId: string;

        const { data: existingCustomer } = await supabase
            .from('stripe_customers')
            .select('stripe_customer_id')
            .eq('user_id', user.id)
            .single();

        if (existingCustomer) {
            stripeCustomerId = existingCustomer.stripe_customer_id;
            console.log('Using existing Stripe customer');
        } else {
            // Create new Stripe customer
            const customer = await stripe.customers.create({
                email: user.email,
                metadata: { supabase_user_id: user.id },
            });
            stripeCustomerId = customer.id;
            console.log('Created new Stripe customer');

            // Save customer link
            await supabase.from('stripe_customers').insert({
                user_id: user.id,
                stripe_customer_id: stripeCustomerId,
            });
        }

        // Create Checkout session
        const session = await stripe.checkout.sessions.create({
            customer: stripeCustomerId,
            mode: 'payment',
            line_items: [
                {
                    price_data: {
                        currency: 'usd',
                        product_data: {
                            name: pack.name,
                            description: `${pack.credits} AI generation credits`,
                        },
                        unit_amount: pack.price_cents,
                    },
                    quantity: 1,
                },
            ],
            metadata: {
                user_id: user.id,
                pack_id: pack_id,
                credits: pack.credits.toString(),
            },
            success_url: success_url || `${req.headers.get('origin')}/dashboard?payment=success`,
            cancel_url: cancel_url || `${req.headers.get('origin')}/dashboard?payment=cancelled`,
        });

        console.log('Checkout session created', { pack: pack_id });

        return new Response(
            JSON.stringify({
                checkout_url: session.url,
                session_id: session.id,
            }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
    } catch (error: unknown) {
        console.error('Error creating checkout session');
        return new Response(
            JSON.stringify({ error: 'Internal server error' }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
    }
});