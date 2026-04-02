import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase-server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { messages } = body as { messages: { role: string; content: string }[] };

    if (!Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json(
        { error: "messages array required" },
        { status: 400 }
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

    const { data: insights } = await supabase
      .from("user_profile_insights")
      .select("insight_value, insight_type")
      .eq("user_id", user.id);

    const insightText = (insights || [])
      .map(
        (i: { insight_value?: string; insight_type?: string }) =>
          [i.insight_type, i.insight_value].filter(Boolean).join(": ")
      )
      .filter(Boolean)
      .join("\n");

    const systemPrompt = insightText
      ? `You are Zyph, a personal AI assistant that has been quietly learning about this specific user from their screen activity. You know them well.

Here is what you know about the user:
${insightText}

How to respond:
- Be concise and direct. 2-4 sentences max for most responses unless a longer answer is genuinely needed.
- Speak naturally like a smart friend who knows them, not like an AI assistant reading from a profile.
- Never use bullet points or bold text unless specifically asked.
- Never start your response with "Based on your activity" or "Based on what I know" — just answer naturally.
- Reference what you know about them only when it's relevant and natural, not in every message.
- If asked what you know about them, give a short punchy summary in your own words — not a list.
- Never say things like "I can see that..." or "According to your profile..." — just speak directly.
- Match their energy — if they're casual, be casual. If they're asking something technical, be precise.`
      : `You are Zyph, a personal AI assistant. This user is new and you haven't learned much about them yet. Be helpful, warm and concise. Encourage them to keep the desktop app running so you can start learning their patterns. Keep responses short — 2-3 sentences max.`;

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
        system: systemPrompt,
        messages: messages.map((m: { role: string; content: string }) => ({
          role: m.role === "assistant" ? "assistant" : "user",
          content: m.content,
        })),
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      console.error("Anthropic API error:", response.status, err);
      return NextResponse.json(
        { error: "AI request failed" },
        { status: 502 }
      );
    }

    const data = (await response.json()) as {
      content?: { type: string; text?: string }[];
    };
    const text =
      data.content?.find((c) => c.type === "text")?.text ?? "";

    return new NextResponse(text, {
      status: 200,
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    });
  } catch (e) {
    console.error("Chat API error:", e);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
