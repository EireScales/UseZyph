import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase-server";
import { getStripe } from "@/lib/stripe-server";
import { parseSubscriptionRow } from "@/lib/subscription-shared";

export async function POST(request: Request) {
  try {
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

    const customerId = parseSubscriptionRow(profile?.subscription)
      .stripe_customer_id;
    if (!customerId) {
      return NextResponse.json(
        { error: "No billing account found. Subscribe from Pricing first." },
        { status: 400 }
      );
    }

    let origin = request.headers.get("origin");
    if (!origin && process.env.NEXT_PUBLIC_SITE_URL) {
      origin = process.env.NEXT_PUBLIC_SITE_URL.replace(/\/$/, "");
    }
    if (!origin) {
      origin = new URL(request.url).origin;
    }

    const returnUrl = `${origin}/dashboard/settings`;

    const stripe = getStripe();
    const session = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: returnUrl,
    });

    if (!session.url) {
      return NextResponse.json(
        { error: "Portal session missing URL" },
        { status: 500 }
      );
    }

    return NextResponse.json({ url: session.url });
  } catch (e) {
    console.error("Stripe portal error:", e);
    return NextResponse.json(
      { error: "Failed to open billing portal" },
      { status: 500 }
    );
  }
}
