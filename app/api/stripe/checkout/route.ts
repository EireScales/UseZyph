import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase-server";
import { getStripe } from "@/lib/stripe-server";
import { parseSubscriptionRow } from "@/lib/subscription";

type BillingInterval = "monthly" | "annual";

function resolvePriceId(interval: BillingInterval): string | null {
  if (interval === "monthly") {
    return (
      process.env.STRIPE_PRICE_ID_MONTHLY ||
      process.env.STRIPE_PRICE_ID ||
      null
    );
  }
  return (
    process.env.STRIPE_PRICE_ID_YEARLY ||
    process.env.STRIPE_PRICE_ID_ANNUAL ||
    process.env.STRIPE_PRICE_ID ||
    null
  );
}

export async function POST(request: Request) {
  try {
    let interval: BillingInterval = "annual";
    let cancelPath = "/dashboard/settings";
    try {
      const body = (await request.json()) as {
        interval?: string;
        source?: string;
      };
      if (body.interval === "monthly") {
        interval = "monthly";
      } else if (body.interval === "annual") {
        interval = "annual";
      }
      if (body.source === "pricing") {
        cancelPath = "/pricing";
      }
    } catch {
      /* empty body */
    }

    const priceId = resolvePriceId(interval);
    if (!priceId) {
      return NextResponse.json(
        {
          error:
            "Stripe price not configured (set STRIPE_PRICE_ID_MONTHLY / STRIPE_PRICE_ID_YEARLY or STRIPE_PRICE_ID)",
        },
        { status: 500 }
      );
    }

    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("subscription")
      .eq("id", user.id)
      .maybeSingle();

    const subscription = parseSubscriptionRow(profile?.subscription);
    const existingCustomerId = subscription.stripe_customer_id;

    let origin = request.headers.get("origin");
    if (!origin && process.env.NEXT_PUBLIC_SITE_URL) {
      origin = process.env.NEXT_PUBLIC_SITE_URL.replace(/\/$/, "");
    }
    if (!origin) {
      origin = new URL(request.url).origin;
    }

    const stripe = getStripe();
    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      ...(existingCustomerId
        ? { customer: existingCustomerId }
        : { customer_email: user.email ?? undefined }),
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${origin}/dashboard?checkout=success`,
      cancel_url: `${origin}${cancelPath}?checkout=cancel`,
      subscription_data: {
        trial_period_days: 14,
        metadata: { supabase_user_id: user.id },
      },
      metadata: { supabase_user_id: user.id },
      allow_promotion_codes: true,
    });

    if (!session.url) {
      return NextResponse.json(
        { error: "Checkout session missing redirect URL" },
        { status: 500 }
      );
    }

    return NextResponse.json({ url: session.url });
  } catch (e) {
    console.error("Stripe checkout error:", e);
    return NextResponse.json(
      { error: "Failed to create checkout session" },
      { status: 500 }
    );
  }
}
