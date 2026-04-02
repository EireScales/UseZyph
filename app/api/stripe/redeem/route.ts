import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase-server";

export async function POST(req: Request) {
  try {
    const { code } = await req.json();
    if (!code) return NextResponse.json({ error: "No code provided" }, { status: 400 });

    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { data: promo, error: promoError } = await supabase
      .from("promo_codes")
      .select("code, tier, expires_at")
      .eq("code", code.toUpperCase().trim())
      .single();

    if (promoError || !promo) return NextResponse.json({ error: "Invalid code" }, { status: 400 });

    if (new Date(promo.expires_at) < new Date()) {
      return NextResponse.json({ error: "This code has expired" }, { status: 400 });
    }

    const { error: updateError } = await supabase
      .from("profiles")
      .update({
        subscription: {
          status: promo.tier,
          trial_end: null,
          stripe_customer_id: null,
          stripe_subscription_id: null,
        }
      })
      .eq("id", user.id);

    if (updateError) return NextResponse.json({ error: "Failed to apply code" }, { status: 500 });

    return NextResponse.json({ ok: true, tier: promo.tier });
  } catch (e) {
    console.error("Redeem error:", e);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
