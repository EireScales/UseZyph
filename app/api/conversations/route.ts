import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase-server";

export async function GET() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data, error } = await supabase
      .from("conversations")
      .select("id, title, created_at, updated_at")
      .eq("user_id", user.id)
      .order("updated_at", { ascending: false });

    if (error) {
      console.error("conversations fetch error:", error);
      return NextResponse.json(
        { error: "Failed to fetch conversations" },
        { status: 500 }
      );
    }

    return NextResponse.json(data ?? []);
  } catch (e) {
    console.error("Conversations GET error:", e);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const { title, messages } = body as {
      title?: string;
      messages?: unknown[];
    };

    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const row = {
      user_id: user.id,
      title: typeof title === "string" ? title.slice(0, 500) : null,
      messages: Array.isArray(messages) ? messages : [],
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from("conversations")
      .insert(row)
      .select("id, title, created_at, updated_at")
      .single();

    if (error) {
      console.error("conversations insert error:", error);
      return NextResponse.json(
        { error: "Failed to save conversation" },
        { status: 500 }
      );
    }

    return NextResponse.json(data);
  } catch (e) {
    console.error("Conversations POST error:", e);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
