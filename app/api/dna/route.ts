import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase-server";

type InsightIn = {
  insight_type?: string | null;
  insight_value?: string | null;
};

function parseDnaJson(text: string): unknown {
  let t = text.trim();
  if (t.startsWith("```")) {
    t = t.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/s, "");
  }
  return JSON.parse(t);
}

export async function POST(req: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();
    if (error || !user)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = (await req.json()) as {
      topApp?: string;
      peakHour?: number;
      dominantCategory?: string;
      daysActive?: number;
      insights?: InsightIn[];
    };

    const topApp = typeof body.topApp === "string" ? body.topApp : "—";
    const peakHour =
      typeof body.peakHour === "number" && Number.isFinite(body.peakHour)
        ? Math.min(23, Math.max(0, Math.floor(body.peakHour)))
        : 12;
    const dominantCategory =
      typeof body.dominantCategory === "string"
        ? body.dominantCategory
        : "Unknown";
    const daysActive =
      typeof body.daysActive === "number" && Number.isFinite(body.daysActive)
        ? Math.max(0, Math.floor(body.daysActive))
        : 0;
    const insights = Array.isArray(body.insights) ? body.insights : [];

    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey)
      return NextResponse.json({ error: "No API key" }, { status: 500 });

    const insightLines = insights.map((i) => {
      const t = i.insight_type ?? "general";
      const v = i.insight_value ?? "";
      return `${t}: ${v}`;
    });

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 512,
        system: `You are Zyph's DNA analyser. Based on a user's behaviour data and insights, generate their work identity archetype.

Respond with JSON only, no markdown:
{
  "archetype": "The [2-3 word title]",
  "summary": "One punchy sentence describing this person's work identity (max 20 words)",
  "traits": ["trait1", "trait2", "trait3"]
}

Archetype examples: "The Midnight Builder", "The Deep Focus Engineer", "The Creative Sprinter", "The Relentless Optimizer". Make it feel personal and accurate, not generic.`,
        messages: [
          {
            role: "user",
            content: `User data:
- Top app: ${topApp}
- Peak hour: ${peakHour}:00
- Dominant category: ${dominantCategory}
- Days active: ${daysActive}
- Insights: ${insightLines.join(", ") || "(none yet)"}`,
          },
        ],
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error("Anthropic DNA error:", response.status, errText);
      return NextResponse.json(
        { error: "Analysis failed" },
        { status: 502 }
      );
    }

    const data = (await response.json()) as {
      content?: { type: string; text?: string }[];
    };
    const text = data.content?.find((c) => c.type === "text")?.text ?? "{}";

    let dna: unknown;
    try {
      dna = parseDnaJson(text);
    } catch (parseErr) {
      console.error("DNA JSON parse error:", parseErr, text);
      return NextResponse.json(
        { error: "Invalid response from model" },
        { status: 502 }
      );
    }

    if (
      !dna ||
      typeof dna !== "object" ||
      !("archetype" in dna) ||
      !("summary" in dna) ||
      !("traits" in dna)
    ) {
      return NextResponse.json(
        { error: "Invalid DNA payload" },
        { status: 502 }
      );
    }

    return NextResponse.json({ dna });
  } catch (e) {
    console.error("DNA API error:", e);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
