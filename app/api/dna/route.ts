import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase-server";

function parseDnaText(text: string): string {
  let t = text.trim();
  if (t.startsWith("```")) {
    t = t.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/s, "");
  }
  return t;
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
      insights?: { insight_type?: string; insight_value?: string }[];
      topApp?: string;
      peakHour?: number;
      dominantCategory?: string;
      daysActive?: number;
    };

    const insights = Array.isArray(body.insights) ? body.insights : [];
    const topApp = body.topApp ?? "—";
    const peakHour =
      typeof body.peakHour === "number" && Number.isFinite(body.peakHour)
        ? body.peakHour
        : 12;
    const dominantCategory = body.dominantCategory ?? "Unknown";
    const daysActive =
      typeof body.daysActive === "number" && Number.isFinite(body.daysActive)
        ? body.daysActive
        : 0;

    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey)
      return NextResponse.json({ error: "No API key" }, { status: 500 });

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
        system: `You are Zyph's DNA analyser. Based on a user's behaviour data, generate their work identity archetype. Respond with JSON only, no markdown:
{"archetype": "The [2-3 word title]", "summary": "One punchy sentence max 20 words", "traits": ["trait1", "trait2", "trait3"]}
Examples: "The Midnight Builder", "The Deep Focus Engineer", "The Creative Sprinter". Make it personal and accurate.`,
        messages: [
          {
            role: "user",
            content: `Top app: ${topApp}, Peak hour: ${peakHour}:00, Dominant category: ${dominantCategory}, Days active: ${daysActive}, Insights: ${insights
              .map(
                (i: { insight_type?: string; insight_value?: string }) =>
                  `${i.insight_type ?? ""}: ${i.insight_value ?? ""}`
              )
              .join(", ")}`,
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
      content?: { type?: string; text?: string }[];
    };
    const raw = data.content?.find((c) => c.type === "text")?.text ?? "{}";
    const text = parseDnaText(typeof raw === "string" ? raw : "{}");

    let dna: unknown;
    try {
      dna = JSON.parse(text);
    } catch (parseErr) {
      console.error("DNA JSON parse error:", parseErr, text);
      return NextResponse.json(
        { error: "Invalid response from model" },
        { status: 502 }
      );
    }

    return NextResponse.json({ dna });
  } catch (e) {
    console.error("DNA API error:", e);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
