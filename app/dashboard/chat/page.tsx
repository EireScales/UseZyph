"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

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
    <div className="flex flex-col h-[calc(100vh-0px)] lg:h-[calc(100vh-0px)]">
      <header
        className="flex items-center justify-between px-6 py-4 shrink-0 border-b border-[#1a1a1a]"
        style={{ background: "#0d0d0d" }}
      >
        <div className="flex items-center gap-3">
          <span className="text-lg font-semibold text-[#f0f0f0]">Zyph</span>
          <span
            className="w-2 h-2 rounded-full bg-[#22c55e] shrink-0 animate-pulse"
            style={{ boxShadow: "0 0 8px #22c55e" }}
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
              <p className="text-[24px] text-[#555] mb-2">Ask anything.</p>
              <p className="text-sm text-[#666] mb-8">
                Zyph uses your profile to respond.
              </p>
              <div className="flex flex-wrap justify-center gap-3">
                {SUGGESTIONS.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => sendMessage(s)}
                    className="px-4 py-2.5 rounded-full text-sm text-[#f0f0f0] border border-[#1e1e1e] bg-[#141414] hover:border-[#333] hover:bg-[#1a1a1a] transition-all duration-200"
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
                            background: "linear-gradient(135deg, #4c1d95 0%, #7c3aed 100%)",
                            color: "#fff",
                          }
                        : {
                            background: "#141414",
                            border: "1px solid #1e1e1e",
                            color: "#e0e0e0",
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
                      background: "#141414",
                      border: "1px solid #1e1e1e",
                    }}
                  >
                    <span className="w-2 h-2 rounded-full bg-[#666] animate-pulse" style={{ animationDelay: "0ms" }} />
                    <span className="w-2 h-2 rounded-full bg-[#666] animate-pulse" style={{ animationDelay: "150ms" }} />
                    <span className="w-2 h-2 rounded-full bg-[#666] animate-pulse" style={{ animationDelay: "300ms" }} />
                  </div>
                </div>
              </div>
            )}
          </div>
          <div ref={messagesEndRef} />
        </div>
      </div>

      <div
        className="shrink-0 p-4 border-t border-[#1a1a1a]"
        style={{ background: "#0d0d0d" }}
      >
        <div className="max-w-3xl mx-auto w-full">
          <form onSubmit={handleSubmit} className="flex gap-3 items-end">
            <div className="flex-1 rounded-xl px-4 py-3 min-h-[48px] flex items-center gap-2 border border-[#1e1e1e] bg-[#141414] focus-within:border-[#7c3aed] transition-colors duration-200">
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
                className="shrink-0 w-10 h-10 rounded-lg flex items-center justify-center text-white disabled:opacity-40 disabled:cursor-not-allowed transition-opacity duration-200 bg-[#7c3aed] hover:opacity-90"
                aria-label="Send"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 2L11 13" />
                  <path d="M22 2L15 22L11 13L2 9L22 2Z" />
                </svg>
              </button>
            </div>
          </form>
          <p className="text-[11px] text-[#333] mt-2 text-center">
            Zyph knows you · Powered by Claude
          </p>
        </div>
      </div>
    </div>
  );
}
