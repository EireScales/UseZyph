"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

const glassCard = {
  background: "rgba(255,255,255,0.04)",
  border: "1px solid rgba(255,255,255,0.08)",
  backdropFilter: "blur(24px)",
};

const SUGGESTIONS = [
  "Help me write an email",
  "What have you learned about me?",
  "Summarise my week",
];

type Message = { role: "user" | "assistant"; content: string };

export default function ChatPage() {
  const router = useRouter();
  const [userId, setUserId] = useState<string | null>(null);
  const [insightsLoaded, setInsightsLoaded] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading, scrollToBottom]);

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

      const { data } = await supabase
        .from("user_profile_insights")
        .select("id")
        .eq("user_id", user.id)
        .limit(1);
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
          className="h-10 w-10 animate-spin rounded-full border-2 border-[#7c3aed] border-t-transparent"
          aria-label="Loading"
        />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-[#000000]">
      <header
        className="flex items-center justify-between px-6 py-4 shrink-0"
        style={{
          background: "rgba(0,0,0,0.4)",
          backdropFilter: "blur(40px)",
          borderBottom: "1px solid rgba(255,255,255,0.06)",
        }}
      >
        <div className="flex items-center gap-3">
          <h1 className="text-xl font-bold text-white">Zyph</h1>
          <span
            className="w-2.5 h-2.5 rounded-full bg-emerald-500 shrink-0"
            style={{ boxShadow: "0 0 8px rgba(52,211,153,0.6)" }}
            aria-hidden
          />
        </div>
        <button
          type="button"
          onClick={handleNewChat}
          className="px-4 py-2 rounded-xl text-sm font-medium text-white/90 border border-white/10 hover:bg-white/5 transition-colors"
        >
          New chat
        </button>
      </header>

      <div
        ref={scrollAreaRef}
        className="flex-1 overflow-y-auto overflow-x-hidden px-4 py-6 chat-scrollbar"
        style={{
          scrollbarWidth: "thin",
          scrollbarColor: "rgba(124,58,237,0.4) rgba(255,255,255,0.05)",
        }}
      >
        <style>{`
          .chat-scrollbar::-webkit-scrollbar { width: 8px; }
          .chat-scrollbar::-webkit-scrollbar-track { background: rgba(255,255,255,0.03); border-radius: 4px; }
          .chat-scrollbar::-webkit-scrollbar-thumb { background: rgba(124,58,237,0.4); border-radius: 4px; }
          .chat-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(124,58,237,0.6); }
        `}</style>
        <div className="max-w-2xl mx-auto chat-scrollbar">
          {messages.length === 0 && !loading && (
            <div className="pt-12 text-center">
              <p className="text-white/50 text-sm mb-6">
                Ask anything. Zyph uses your profile to respond.
              </p>
              <div className="flex flex-wrap justify-center gap-3">
                {SUGGESTIONS.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => sendMessage(s)}
                    className="px-4 py-2.5 rounded-full text-sm text-white/80 border border-white/10 hover:border-[#7c3aed]/50 hover:bg-[#7c3aed]/10 transition-colors"
                    style={glassCard}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="space-y-6">
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl px-4 py-3 ${
                    msg.role === "user"
                      ? "rounded-br-md"
                      : "rounded-bl-md"
                  }`}
                  style={
                    msg.role === "user"
                      ? {
                          background:
                            "linear-gradient(135deg, rgba(124,58,237,0.25) 0%, rgba(232,131,122,0.2) 100%)",
                          border: "1px solid rgba(255,255,255,0.08)",
                        }
                      : glassCard
                  }
                >
                  <p className="text-white text-sm leading-relaxed whitespace-pre-wrap">
                    {msg.content}
                  </p>
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex justify-start">
                <div
                  className="rounded-2xl rounded-bl-md px-4 py-3 flex gap-1.5"
                  style={glassCard}
                >
                  <span
                    className="w-2 h-2 rounded-full bg-white/60 animate-bounce"
                    style={{ animationDelay: "0ms" }}
                  />
                  <span
                    className="w-2 h-2 rounded-full bg-white/60 animate-bounce"
                    style={{ animationDelay: "150ms" }}
                  />
                  <span
                    className="w-2 h-2 rounded-full bg-white/60 animate-bounce"
                    style={{ animationDelay: "300ms" }}
                  />
                </div>
              </div>
            )}
          </div>
          <div ref={messagesEndRef} />
        </div>
      </div>

      <div
        className="shrink-0 px-4 py-4"
        style={{
          background: "rgba(0,0,0,0.3)",
          borderTop: "1px solid rgba(255,255,255,0.06)",
        }}
      >
        <div className="max-w-2xl mx-auto">
          <form onSubmit={handleSubmit} className="flex gap-3 items-end">
            <div
              className="flex-1 rounded-2xl px-4 py-2.5 flex items-center gap-2 min-h-[48px]"
              style={glassCard}
            >
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Message Zyph…"
                disabled={loading}
                className="flex-1 bg-transparent text-white placeholder-white/40 text-sm focus:outline-none min-w-0"
              />
              <button
                type="submit"
                disabled={loading || !input.trim()}
                className="shrink-0 w-10 h-10 rounded-xl flex items-center justify-center text-white disabled:opacity-40 disabled:cursor-not-allowed transition-opacity"
                style={{
                  background:
                    "linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%)",
                  boxShadow: "0 2px 12px rgba(124,58,237,0.35)",
                }}
                aria-label="Send"
              >
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M22 2L11 13" />
                  <path d="M22 2L15 22L11 13L2 9L22 2Z" />
                </svg>
              </button>
            </div>
          </form>
          <p className="text-white/35 text-xs mt-2 text-center">
            Zyph knows you
          </p>
        </div>
      </div>
    </div>
  );
}