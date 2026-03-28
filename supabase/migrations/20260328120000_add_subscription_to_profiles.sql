-- Subscription state for Stripe (JSON column on profiles)
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS subscription jsonb NOT NULL DEFAULT '{"status":"free","trial_end":null,"stripe_customer_id":null,"stripe_subscription_id":null}'::jsonb;

COMMENT ON COLUMN public.profiles.subscription IS 'Stripe subscription snapshot: status (free|trialing|pro), trial_end ISO timestamp, stripe_customer_id, stripe_subscription_id';
