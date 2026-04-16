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
      <div style={{ display: "flex", minHeight: "100vh", alignItems: "center", justifyContent: "center", background: "#08090a" }}>
        <div
          className="h-10 w-10 animate-spin rounded-full border-2 border-t-transparent"
          style={{ borderColor: "#6366f1", borderTopColor: "transparent" }}
          aria-label="Loading"
        />
      </div>
    );
  }

  return (
    <div style={{ height: "100vh", display: "flex", flexDirection: "column", background: "#08090a", overflow: "hidden" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Instrument+Serif:ital,wght@0,400;1,400&family=Inter:wght@400;500;600;700&display=swap');
        .chat-input:focus { border-color: rgba(99,102,241,0.5) !important; background: rgba(255,255,255,0.06) !important; }
        .chat-input::placeholder { color: #525252; }
        .chat-scrollbar::-webkit-scrollbar { width: 6px; }
        .chat-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .chat-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.08); border-radius: 3px; }
        .chip-btn:hover { background: rgba(255,255,255,0.06) !important; }
        .new-chat-btn:hover { background: rgba(255,255,255,0.05) !important; }
        .send-btn:hover:not(:disabled) { opacity: 0.88; }
      `}</style>

      {/* Header */}
      <header style={{ borderBottom: "1px solid rgba(255,255,255,0.06)", padding: "14px 40px", display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <span style={{ fontFamily: "'Instrument Serif', serif", fontStyle: "italic", fontSize: "19px", color: "#F2F2F2", letterSpacing: "-0.02em" }}>Zyph</span>
          <span style={{ display: "inline-block", width: "5px", height: "5px", borderRadius: "50%", background: "#22c55e", boxShadow: "0 0 6px rgba(34,197,94,0.6)" }} aria-hidden />
        </div>
        <button
          type="button"
          onClick={handleNewChat}
          className="new-chat-btn"
          style={{ padding: "7px 16px", borderRadius: "8px", fontSize: "13px", fontWeight: 500, color: "#8a8f98", background: "transparent", border: "1px solid rgba(255,255,255,0.08)", cursor: "pointer", fontFamily: "Inter, sans-serif", transition: "background 0.15s" }}
        >
          New chat
        </button>
      </header>

      {/* Messages scroll area */}
      <div
        ref={scrollAreaRef}
        className="chat-scrollbar"
        style={{ flex: 1, overflowY: "auto", padding: "24px 40px" }}
      >
        <div style={{ maxWidth: "800px", margin: "0 auto", width: "100%" }}>

          {/* Welcome state */}
          {messages.length === 0 && !loading && (
            <div style={{ paddingTop: "80px", textAlign: "center" }}>
              <p style={{ fontFamily: "'Instrument Serif', serif", fontStyle: "italic", fontSize: "36px", color: "#F2F2F2", letterSpacing: "-0.02em", marginBottom: "12px" }}>
                Ask anything.
              </p>
              <p style={{ fontSize: "15px", color: "#525252", marginBottom: "40px", fontFamily: "Inter, sans-serif" }}>
                Zyph uses your profile to respond.
              </p>
              <div style={{ display: "inline-flex", flexWrap: "wrap", gap: "10px", justifyContent: "center" }}>
                {SUGGESTIONS.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => sendMessage(s)}
                    className="chip-btn"
                    style={{
                      background: "rgba(255,255,255,0.03)",
                      border: "1px solid rgba(255,255,255,0.08)",
                      color: "#8a8f98",
                      borderRadius: "8px",
                      padding: "9px 16px",
                      fontSize: "13px",
                      cursor: "pointer",
                      fontFamily: "Inter, sans-serif",
                      transition: "background 0.15s",
                    }}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Message list */}
          <div style={{ display: "flex", flexDirection: "column", paddingTop: messages.length > 0 ? "8px" : "0" }}>
            {messages.map((msg, i) => (
              <div
                key={i}
                style={{
                  display: "flex",
                  justifyContent: msg.role === "user" ? "flex-end" : "flex-start",
                  marginBottom: msg.role === "user" ? "12px" : "16px",
                }}
              >
                <div style={{ maxWidth: msg.role === "user" ? "75%" : "85%" }}>
                  {msg.role === "assistant" && (
                    <p style={{ fontSize: "11px", color: "#3f3f46", marginBottom: "4px", marginLeft: "4px", fontFamily: "Inter, sans-serif" }}>Zyph</p>
                  )}
                  <div
                    style={
                      msg.role === "user"
                        ? {
                            background: "#6366f1",
                            color: "#fff",
                            borderRadius: "14px 14px 4px 14px",
                            padding: "10px 14px",
                            fontSize: "14px",
                            lineHeight: 1.6,
                          }
                        : {
                            background: "rgba(255,255,255,0.04)",
                            border: "1px solid rgba(255,255,255,0.07)",
                            color: "#c4c9d4",
                            borderRadius: "4px 14px 14px 14px",
                            padding: "12px 14px",
                            fontSize: "14px",
                            lineHeight: 1.75,
                          }
                    }
                  >
                    <p style={{ margin: 0, whiteSpace: "pre-wrap", fontFamily: "Inter, sans-serif" }}>
                      {msg.content}
                    </p>
                  </div>
                </div>
              </div>
            ))}

            {/* Loading dots */}
            {loading && (
              <div style={{ display: "flex", justifyContent: "flex-start", marginBottom: "16px" }}>
                <div>
                  <p style={{ fontSize: "11px", color: "#3f3f46", marginBottom: "4px", marginLeft: "4px", fontFamily: "Inter, sans-serif" }}>Zyph</p>
                  <div
                    style={{
                      background: "rgba(255,255,255,0.04)",
                      border: "1px solid rgba(255,255,255,0.07)",
                      borderRadius: "4px 14px 14px 14px",
                      padding: "12px 14px",
                      display: "flex",
                      gap: "5px",
                      alignItems: "center",
                    }}
                  >
                    <span className="animate-pulse" style={{ width: "7px", height: "7px", borderRadius: "50%", background: "#6366f1", display: "inline-block", animationDelay: "0ms" }} />
                    <span className="animate-pulse" style={{ width: "7px", height: "7px", borderRadius: "50%", background: "#6366f1", display: "inline-block", animationDelay: "150ms" }} />
                    <span className="animate-pulse" style={{ width: "7px", height: "7px", borderRadius: "50%", background: "#6366f1", display: "inline-block", animationDelay: "300ms" }} />
                  </div>
                </div>
              </div>
            )}
          </div>

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input area */}
      <div style={{ background: "rgba(8,9,10,0.95)", backdropFilter: "blur(20px)", borderTop: "1px solid rgba(255,255,255,0.07)", padding: "16px 40px 24px", flexShrink: 0 }}>
        <div style={{ maxWidth: "800px", margin: "0 auto", width: "100%" }}>
          <form onSubmit={handleSubmit} style={{ display: "flex", gap: "10px", alignItems: "center" }}>
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
              className="chat-input"
              style={{
                flex: 1,
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.08)",
                color: "#F2F2F2",
                borderRadius: "10px",
                padding: "12px 16px",
                fontSize: "14px",
                width: "100%",
                outline: "none",
                fontFamily: "Inter, sans-serif",
                transition: "border-color 0.15s, background 0.15s",
              }}
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="send-btn"
              style={{
                background: "#6366f1",
                color: "#fff",
                borderRadius: "8px",
                padding: "10px 14px",
                border: "none",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
                transition: "opacity 0.15s",
                opacity: loading || !input.trim() ? 0.4 : 1,
              }}
              aria-label="Send"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 2L11 13" />
                <path d="M22 2L15 22L11 13L2 9L22 2Z" />
              </svg>
            </button>
          </form>
          <div style={{ marginTop: "10px", textAlign: "center" }}>
            {isFreeUser && (
              <p style={{ fontSize: "11px", color: "#525252", marginBottom: "2px", fontFamily: "Inter, sans-serif" }}>
                Pro users get priority AI responses
              </p>
            )}
            <p style={{ fontSize: "11px", color: "#3f3f46", fontFamily: "Inter, sans-serif" }}>
              Zyph knows you · Powered by Claude
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
