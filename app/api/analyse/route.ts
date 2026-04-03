import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase-server";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import {
  isFreeTier,
  parseSubscriptionRow,
  startOfUtcDayIso,
} from "@/lib/subscription-shared";

const ANALYSE_SYSTEM = `You are an analyst for a personal AI product. Given raw text captured from the user's screen or activity, respond with a JSON object only (no markdown, no code block), with these exact keys:
- summary: string (one short sentence describing what the user was doing)
- category: string (one of: Work, Creative, Learning, Communication, Other)
- insights: array of strings (0-3 brief insight strings about the user's behavior or context)`;

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      raw_text,
      app_name,
      captured_at,
      userId,
    } = body as {
      raw_text?: string;
      app_name?: string;
      captured_at?: string;
      userId?: string;
    };

    if (!raw_text || typeof raw_text !== "string") {
      return NextResponse.json(
        { error: "raw_text required" },
        { status: 400 }
      );
    }

    // Determine auth path: Bearer token (desktop) vs cookie session (web)
    let effectiveUserId: string | undefined = userId;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let supabase: any;

    const authHeader = req.headers.get("Authorization");

    if (authHeader?.startsWith("Bearer ")) {
      // --- Desktop app path ---
      // Must use a fresh Supabase client initialised with the user's token,
      // NOT the cookie-based server client (which ignores the Bearer token).
      const token = authHeader.replace("Bearer ", "").trim();

      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

      if (!supabaseUrl || !supabaseAnonKey) {
        console.error("Missing Supabase env vars");
        return NextResponse.json(
          { error: "Server misconfigured" },
          { status: 500 }
        );
      }

      // Create a client that carries the user's JWT in every request
      supabase = createSupabaseClient(supabaseUrl, supabaseAnonKey, {
        global: {
          headers: { Authorization: `Bearer ${token}` },
        },
      });

      // Validate the token and extract the user id
      const { data: { user }, error } = await supabase.auth.getUser(token);
      if (error || !user) {
        console.error("Bearer token validation failed:", error?.message);
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
      effectiveUserId = user.id;
      console.log("Desktop auth OK, userId:", effectiveUserId);
    } else {
      // --- Web app path — cookie session ---
      const cookieClient = await createClient();
      const { data: { user }, error: authError } = await cookieClient.auth.getUser();
      if (authError || !user) {
        console.error("Cookie auth failed:", authError?.message);
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
      effectiveUserId = user.id;
      supabase = cookieClient as unknown as ReturnType<typeof createSupabaseClient>;
    }

    if (!effectiveUserId) {
      return NextResponse.json({ error: "Could not resolve user id" }, { status: 401 });
    }

    // --- Free tier: daily capture limit (before Claude to save cost) ---
    const { data: profileForLimit } = await supabase
      .from("profiles")
      .select("subscription")
      .eq("id", effectiveUserId)
      .maybeSingle();

    const subRow = parseSubscriptionRow(profileForLimit?.subscription as Record<string, unknown> | null | undefined);
    if (isFreeTier(subRow)) {
      const dayStart = startOfUtcDayIso();
      const { count: todayCount, error: countError } = await supabase
        .from("observations")
        .select("id", { count: "exact", head: true })
        .eq("user_id", effectiveUserId)
        .gte("captured_at", dayStart);

      if (countError) {
        console.error("Daily limit count error:", countError.message);
      } else if ((todayCount ?? 0) >= 80) {
        return NextResponse.json(
          { error: "Daily limit reached", upgrade: true },
          { status: 429 }
        );
      }
    }

    // --- Call Claude ---
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "ANTHROPIC_API_KEY not configured" },
        { status: 500 }
      );
    }

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 1024,
        system: ANALYSE_SYSTEM,
        messages: [
          {
            role: "user",
            content: `App: ${app_name ?? "unknown"}. Captured: ${captured_at ?? "unknown"}.\n\nRaw text:\n${raw_text.slice(0, 16000)}`,
          },
        ],
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      console.error("Anthropic analyse error:", response.status, err);
      return NextResponse.json(
        { error: "Analysis failed" },
        { status: 502 }
      );
    }

    const claudeData = (await response.json()) as {
      content?: { type: string; text?: string }[];
    };
    const claudeText = claudeData.content?.find((c) => c.type === "text")?.text ?? "{}";

    let summary = "";
    let category = "Other";
    let insights: string[] = [];
    try {
      const parsed = JSON.parse(claudeText.trim()) as {
        summary?: string;
        category?: string;
        insights?: string[];
      };
      summary = typeof parsed.summary === "string" ? parsed.summary : "";
      category = typeof parsed.category === "string" ? parsed.category : "Other";
      insights = Array.isArray(parsed.insights) ? parsed.insights : [];
    } catch {
      console.warn("Failed to parse Claude JSON, falling back to raw text summary");
      summary = raw_text.slice(0, 200);
    }

    // --- Save observation ---
    const observationRow = {
      user_id: effectiveUserId,
      raw_text: raw_text.slice(0, 32000),
      app_name: app_name ?? null,
      captured_at: captured_at ?? new Date().toISOString(),
      summary: summary || null,
      category: category || null,
    };

    const { error: obsError } = await supabase
      .from("observations")
      .insert(observationRow);

    if (obsError) {
      // Surface this clearly — this is the most common silent failure point
      console.error("❌ observations insert error:", JSON.stringify(obsError));
      // Return error so Electron logs it instead of silently succeeding
      return NextResponse.json(
        { error: "Failed to save observation", detail: obsError.message },
        { status: 500 }
      );
    }

    console.log("✅ Observation saved for user:", effectiveUserId);

    // --- Save insights ---
    for (const insight of insights.slice(0, 3)) {
      if (!insight || typeof insight !== "string") continue;
      const { error: insightError } = await supabase
        .from("user_profile_insights")
        .insert({
          user_id: effectiveUserId,
          insight_type: category,
          insight_value: insight,
          confidence_score: 0.8,
          updated_at: new Date().toISOString(),
        });
      if (insightError) {
        console.error("❌ insight insert error:", JSON.stringify(insightError));
      }
    }

    if (summary && insights.length === 0) {
      const { error: fallbackError } = await supabase
        .from("user_profile_insights")
        .insert({
          user_id: effectiveUserId,
          insight_type: category,
          insight_value: summary,
          confidence_score: 0.7,
          updated_at: new Date().toISOString(),
        });
      if (fallbackError) {
        console.error("❌ fallback insight insert error:", JSON.stringify(fallbackError));
      }
    }

    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (e) {
    console.error("Analyse API error:", e);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
