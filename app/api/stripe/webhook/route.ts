import { NextResponse } from "next/server";
import type { SupabaseClient } from "@supabase/supabase-js";
import type Stripe from "stripe";
import { getStripe } from "@/lib/stripe-server";
import { createServiceRoleClient } from "@/lib/supabase-service";
import {
  subscriptionAfterStripeDeletion,
  subscriptionFromStripeSubscription,
} from "@/lib/subscription";

export const runtime = "nodejs";

async function findUserIdByStripeSubscriptionId(
  supabase: SupabaseClient,
  stripeSubscriptionId: string
): Promise<string | null> {
  const { data, error } = await supabase
    .from("profiles")
    .select("id")
    .contains("subscription", { stripe_subscription_id: stripeSubscriptionId })
    .limit(1)
    .maybeSingle();
  if (error) {
    console.error("lookup profile by subscription:", error.message);
    return null;
  }
  return data?.id ?? null;
}

export async function POST(request: Request) {
  const rawBody = await request.text();
  const signature = request.headers.get("stripe-signature");
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!signature || !secret) {
    return NextResponse.json(
      { error: "Missing webhook signature or secret" },
      { status: 400 }
    );
  }

  let event: Stripe.Event;
  try {
    event = getStripe().webhooks.constructEvent(rawBody, signature, secret);
  } catch (err) {
    console.error("Webhook signature verification failed:", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  const supabase = createServiceRoleClient();
  const stripe = getStripe();

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        if (session.mode !== "subscription") {
          break;
        }
        const userId = session.metadata?.supabase_user_id;
        if (!userId) {
          console.error("checkout.session.completed missing supabase_user_id");
          break;
        }
        const subId = session.subscription;
        if (typeof subId !== "string") {
          break;
        }
        const sub = await stripe.subscriptions.retrieve(subId);
        const row = subscriptionFromStripeSubscription(sub);
        const { error } = await supabase
          .from("profiles")
          .update({ subscription: row })
          .eq("id", userId);
        if (error) {
          console.error("profiles update error:", error.message);
        }
        break;
      }
      case "customer.subscription.updated": {
        const sub = event.data.object as Stripe.Subscription;
        const userId =
          sub.metadata?.supabase_user_id ??
          (await findUserIdByStripeSubscriptionId(supabase, sub.id));
        if (!userId) {
          console.error("customer.subscription.updated: could not resolve user");
          break;
        }
        const row = subscriptionFromStripeSubscription(sub);
        const { error } = await supabase
          .from("profiles")
          .update({ subscription: row })
          .eq("id", userId);
        if (error) {
          console.error("profiles update error:", error.message);
        }
        break;
      }
      case "customer.subscription.deleted": {
        const sub = event.data.object as Stripe.Subscription;
        const userId =
          sub.metadata?.supabase_user_id ??
          (await findUserIdByStripeSubscriptionId(supabase, sub.id));
        if (!userId) {
          console.error("customer.subscription.deleted: could not resolve user");
          break;
        }
        const row = subscriptionAfterStripeDeletion(sub);
        const { error } = await supabase
          .from("profiles")
          .update({ subscription: row })
          .eq("id", userId);
        if (error) {
          console.error("profiles update error:", error.message);
        }
        break;
      }
      default:
        break;
    }
  } catch (e) {
    console.error("Webhook handler error:", e);
    return NextResponse.json({ error: "Handler failed" }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
