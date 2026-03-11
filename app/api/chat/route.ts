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
      .select("content, summary, type, category")
      .eq("user_id", user.id);

    const insightText = (insights || [])
      .map(
        (i: { content?: string; summary?: string; type?: string; category?: string }) =>
          [i.content || i.summary, i.type || i.category].filter(Boolean).join(" — ")
      )
      .filter(Boolean)
      .join("\n");

    const systemPrompt = insightText
      ? `You are Zyph, a personal AI that knows this user from their activity and profile insights. Use the following context to respond in a helpful, personal way. Do not invent facts; if you don't have relevant context, say so.\n\nContext about the user:\n${insightText}`
      : "You are Zyph, a personal AI assistant. The user has not yet built up much profile data; be helpful and encourage them to use the desktop app so you can learn more about them.";

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
