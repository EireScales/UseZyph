import type Stripe from "stripe";
import { createClient } from "@/lib/supabase-server";
import {
  type PlanStatus,
  type SubscriptionRow,
  defaultSubscription,
  parseSubscriptionRow,
} from "@/lib/subscription-shared";

export type { PlanStatus, SubscriptionRow };
export {
  defaultSubscription,
  isFreeTier,
  parseSubscriptionRow,
  startOfUtcDayIso,
} from "@/lib/subscription-shared";

/** Maps a Stripe subscription to the shape stored in profiles.subscription. */
export function subscriptionFromStripeSubscription(
  sub: Stripe.Subscription
): SubscriptionRow {
  const customerId =
    typeof sub.customer === "string" ? sub.customer : sub.customer.id;
  const trialEnd =
    sub.trial_end != null
      ? new Date(sub.trial_end * 1000).toISOString()
      : null;

  let status: PlanStatus = "free";
  if (sub.status === "trialing") {
    status = "trialing";
  } else if (sub.status === "active" || sub.status === "past_due") {
    status = "pro";
  }

  return {
    status,
    trial_end: trialEnd,
    stripe_customer_id: customerId,
    stripe_subscription_id: sub.id,
  };
}

/** After subscription deletion: keep Stripe customer id for future checkout. */
export function subscriptionAfterStripeDeletion(
  sub: Stripe.Subscription
): SubscriptionRow {
  const customerId =
    typeof sub.customer === "string" ? sub.customer : sub.customer.id;
  return {
    status: "free",
    trial_end: null,
    stripe_customer_id: customerId,
    stripe_subscription_id: null,
  };
}

/**
 * Loads the authenticated user's subscription snapshot from profiles (cookie session).
 * Uses @supabase/ssr via createClient from supabase-server.
 */
export async function getUserSubscription(
  userId: string
): Promise<SubscriptionRow> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("profiles")
    .select("subscription")
    .eq("id", userId)
    .maybeSingle();

  if (error || !data) {
    return defaultSubscription();
  }

  return parseSubscriptionRow(data.subscription);
}
