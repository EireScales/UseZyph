"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase";
import { isFreeTier, parseSubscriptionRow } from "@/lib/subscription-shared";

const SUGGESTIONS = [
  "Help me write an email",
  "What have you learned about me?",
  "Summarise my week",
];

type Message = { role: "user" | "assistant"; content: string };

export default function ChatPage() {
  const router = useRouter();
  const supabase = createSupabaseBrowserClient();
  const [userId, setUserId] = useState<string | null>(null);
  const [insightsLoaded, setInsightsLoaded] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [isFreeUser, setIsFreeUser] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading, scrollToBottom]);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    const init = async () => {
      const {
        data: { user },
        error: sessionError,
      } = await supabase.auth.getUser();
      if (sessionError || !user) {
        router.replace("/auth");
        return;
      }
      setUserId(user.id);

      const [profileRes] = await Promise.all([
        supabase
          .from("profiles")
          .select("subscription")
          .eq("id", user.id)
          .maybeSingle(),
        supabase
          .from("user_profile_insights")
          .select("id")
          .eq("user_id", user.id)
          .limit(1),
      ]);
      setIsFreeUser(
        isFreeTier(parseSubscriptionRow(profileRes.data?.subscription))
      );
      setInsightsLoaded(true);
    };
    init();
  }, [router]);

  const sendMessage = async (content: string) => {
    const trimmed = content.trim();
    if (!trimmed || !userId || loading) return;

    const userMessage: Message = { role: "user", content: trimmed };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [...messages, userMessage].map((m) => ({
            role: m.role,
            content: m.content,
          })),
          userId,
        }),
      });

      const text = await response.text();
      if (!response.ok) {
        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: `Error: ${text || response.statusText}` },
        ]);
        return;
      }
      setMessages((prev) => [...prev, { role: "assistant", content: text }]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Something went wrong. Please try again." },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(input);
  };

  const handleNewChat = () => {
    setMessages([]);
    setInput("");
  };

  if (!insightsLoaded && userId === null) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div
          className="h-10 w-10 animate-spin rounded-full border-2 border-t-transparent"
          style={{ borderColor: "#6366f1", borderTopColor: "transparent" }}
          aria-label="Loading"
        />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-0px)] lg:h-[calc(100vh-0px)]">
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Instrument+Serif:ital,wght@0,400;1,400&family=Inter:wght@400;500;600;700&display=swap');`}</style>
      <header
        className="flex items-center justify-between px-6 py-4 shrink-0"
        style={{ background: "#08090a", borderBottom: "1px solid rgba(255,255,255,0.06)" }}
      >
        <div className="flex items-center gap-2">
          <span style={{ fontFamily: "'Instrument Serif', serif", fontStyle: "italic", fontSize: "19px", color: "#F2F2F2", letterSpacing: "-0.02em" }}>Zyph</span>
          <span
            style={{ display: "inline-block", width: "5px", height: "5px", borderRadius: "50%", background: "#22c55e", flexShrink: 0, boxShadow: "0 0 6px rgba(34,197,94,0.6)" }}
            aria-hidden
          />
        </div>
        <button
          type="button"
          onClick={handleNewChat}
          className="px-4 py-2 rounded-lg text-sm font-medium text-[#f0f0f0] border border-[#1e1e1e] hover:bg-[#141414] transition-colors duration-200"
        >
          New chat
        </button>
      </header>

      <div
        ref={scrollAreaRef}
        className="flex-1 overflow-y-auto flex flex-col gap-4 p-6"
        style={{ background: "transparent" }}
      >
        <style>{`
          .chat-scrollbar::-webkit-scrollbar { width: 8px; }
          .chat-scrollbar::-webkit-scrollbar-track { background: #0a0a0a; border-radius: 4px; }
          .chat-scrollbar::-webkit-scrollbar-thumb { background: #2a2a2a; border-radius: 4px; }
        `}</style>
        <div className="max-w-3xl mx-auto w-full chat-scrollbar">
          {messages.length === 0 && !loading && (
            <div className="flex flex-col items-center justify-center min-h-[40vh] text-center">
                  <p style={{ fontFamily: "'Instrument Serif', serif", fontStyle: "italic", fontSize: "28px", color: "#8a8f98", marginBottom: "8px", letterSpacing: "-0.01em" }}>Ask anything.</p>
              <p style={{ fontSize: "13px", color: "#525252", marginBottom: "28px", fontFamily: "Inter, sans-serif" }}>
                Zyph uses your profile to respond.
              </p>
              <div className="flex flex-wrap justify-center gap-3">
                {SUGGESTIONS.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => sendMessage(s)}
                    className="px-4 py-2.5 rounded-full text-sm text-[#8a8f98] border border-[rgba(255,255,255,0.07)] bg-[rgba(255,255,255,0.02)] hover:border-[rgba(255,255,255,0.12)] hover:text-[#F2F2F2] transition-all duration-200"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="flex flex-col gap-4">
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={msg.role === "user" ? "max-w-[70%]" : "max-w-[75%]"}
                >
                  {msg.role === "assistant" && (
                    <p className="text-[11px] text-[#444] mb-1 ml-1">Zyph</p>
                  )}
                  <div
                    className={`rounded-2xl px-4 py-3 ${
                      msg.role === "user"
                        ? "rounded-br-sm"
                        : "rounded-bl-sm"
                    }`}
                    style={
                      msg.role === "user"
                        ? {
                            background: "#6366f1",
                            color: "#fff",
                          }
                        : {
                            background: "rgba(255,255,255,0.03)",
                            border: "1px solid rgba(255,255,255,0.08)",
                            color: "#F2F2F2",
                          }
                    }
                  >
                    <p className="text-sm leading-relaxed whitespace-pre-wrap">
                      {msg.content}
                    </p>
                  </div>
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex justify-start">
                <div>
                  <p className="text-[11px] text-[#444] mb-1 ml-1">Zyph</p>
                  <div
                    className="rounded-2xl rounded-bl-sm px-4 py-3 flex gap-1 items-center"
                    style={{
                      background: "rgba(255,255,255,0.03)",
                      border: "1px solid rgba(255,255,255,0.08)",
                    }}
                  >
                    <span className="w-2 h-2 rounded-full animate-pulse" style={{ background: "rgba(99,102,241,0.6)", animationDelay: "0ms" }} />
                    <span className="w-2 h-2 rounded-full animate-pulse" style={{ background: "rgba(99,102,241,0.6)", animationDelay: "150ms" }} />
                    <span className="w-2 h-2 rounded-full animate-pulse" style={{ background: "rgba(99,102,241,0.6)", animationDelay: "300ms" }} />
                  </div>
                </div>
              </div>
            )}
          </div>
          <div ref={messagesEndRef} />
        </div>
      </div>

      <div
        className="shrink-0 p-4"
        style={{ background: "#08090a", borderTop: "1px solid rgba(255,255,255,0.06)" }}
      >
        <div className="max-w-3xl mx-auto w-full">
          <form onSubmit={handleSubmit} className="flex gap-3 items-end">
            <div className="flex-1 rounded-xl px-4 py-3 min-h-[48px] flex items-center gap-2 border border-[rgba(255,255,255,0.07)] bg-[rgba(255,255,255,0.02)] focus-within:border-[#6366f1] transition-colors duration-200">
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    sendMessage(input);
                  }
                }}
                placeholder="Message Zyph..."
                disabled={loading}
                className="flex-1 bg-transparent text-[#f0f0f0] placeholder-[#666] text-sm focus:outline-none min-w-0"
              />
              <button
                type="submit"
                disabled={loading || !input.trim()}
                className="shrink-0 w-10 h-10 rounded-lg flex items-center justify-center text-white disabled:opacity-40 disabled:cursor-not-allowed transition-opacity duration-200 bg-[#6366f1] hover:opacity-90"
                aria-label="Send"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 2L11 13" />
                  <path d="M22 2L15 22L11 13L2 9L22 2Z" />
                </svg>
              </button>
            </div>
          </form>
          <div className="mt-2 space-y-1 text-center">
            {isFreeUser && (
              <p className="text-[11px] text-[#6b7280]">
                Pro users get priority AI responses
              </p>
            )}
            <p className="text-[11px] text-[#333]">
              Zyph knows you · Powered by Claude
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
