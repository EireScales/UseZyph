import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase-server";

type ObsRow = {
  app_name?: string | null;
  summary?: string | null;
  captured_at?: string | null;
};

function parseCaughtJson(text: string): unknown {
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

    const body = (await req.json()) as { observations?: ObsRow[] };
    const observations = Array.isArray(body.observations) ? body.observations : [];

    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey)
      return NextResponse.json({ error: "No API key" }, { status: 500 });

    const lines = observations.map(
      (o) =>
        `${o.app_name ?? "Unknown"}: ${o.summary ?? "(no summary)"} (${o.captured_at ?? ""})`
    );
    const userContent = `Here are the user's recent screen captures. Call them out:\n\n${lines.join("\n")}`;

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
        system: `You are Zyph's "Caught in 4K" feature. You analyse a user's screen capture history and call them out on their real behaviour in a brutally honest, funny, and slightly savage way — like a smart friend who has been watching over their shoulder. 

Generate exactly 5 "caught" moments. Each must be:
- Short punchy headline (max 8 words) 
- One brutal honest sentence about what you observed
- Funny but not mean — like a roast not an attack

Respond with a JSON array only, no markdown:
[
  { "headline": "...", "detail": "...", "app": "..." },
  ...
]`,
        messages: [
          {
            role: "user",
            content: userContent,
          },
        ],
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error("Anthropic caught error:", response.status, errText);
      return NextResponse.json(
        { error: "Analysis failed" },
        { status: 502 }
      );
    }

    const data = (await response.json()) as {
      content?: { type: string; text?: string }[];
    };
    const text = data.content?.find((c) => c.type === "text")?.text ?? "[]";

    let caught: unknown;
    try {
      caught = parseCaughtJson(text);
    } catch (parseErr) {
      console.error("Caught JSON parse error:", parseErr, text);
      return NextResponse.json(
        { error: "Invalid response from model" },
        { status: 502 }
      );
    }

    if (!Array.isArray(caught)) {
      return NextResponse.json(
        { error: "Invalid caught payload" },
        { status: 502 }
      );
    }

    return NextResponse.json({ caught });
  } catch (e) {
    console.error("Caught API error:", e);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
