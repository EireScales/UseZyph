import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase-server";

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

    const supabase = await createClient();

// Try cookie-based auth first (web app)
let effectiveUserId = userId;

const authHeader = req.headers.get('Authorization');
if (authHeader?.startsWith('Bearer ')) {
  // Desktop app sends Bearer token
  const token = authHeader.replace('Bearer ', '');
  const { data: { user }, error } = await supabase.auth.getUser(token);
  if (error || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  effectiveUserId = user.id;
} else {
  // Web app uses cookie session
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  effectiveUserId = user.id;
}
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

    const data = (await response.json()) as {
      content?: { type: string; text?: string }[];
    };
    const text = data.content?.find((c) => c.type === "text")?.text ?? "{}";

    let summary = "";
    let category = "Other";
    let insights: string[] = [];
    try {
      const parsed = JSON.parse(text.trim()) as {
        summary?: string;
        category?: string;
        insights?: string[];
      };
      summary = typeof parsed.summary === "string" ? parsed.summary : "";
      category =
        typeof parsed.category === "string" ? parsed.category : "Other";
      insights = Array.isArray(parsed.insights) ? parsed.insights : [];
    } catch {
      summary = raw_text.slice(0, 200);
    }

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
      console.error("observations insert error:", obsError);
    }

    for (const insight of insights.slice(0, 5)) {
      if (!insight || typeof insight !== "string") continue;
      await supabase.from("user_profile_insights").insert({
        user_id: effectiveUserId,
        content: insight,
        category,
        type: category,
        confidence: 0.8,
        updated_at: new Date().toISOString(),
      });
    }

    if (summary && insights.length === 0) {
      await supabase.from("user_profile_insights").insert({
        user_id: effectiveUserId,
        content: summary,
        summary: summary,
        category,
        type: category,
        confidence: 0.7,
        updated_at: new Date().toISOString(),
      });
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
