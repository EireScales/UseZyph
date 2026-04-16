"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createSupabaseBrowserClient } from "@/lib/supabase";

const GoogleIcon = () => (
  <svg viewBox="0 0 24 24" width={18} height={18} style={{ flexShrink: 0 }}>
    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
  </svg>
);

export default function AuthPage() {
  const router = useRouter();
  const supabase = createSupabaseBrowserClient();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [oauthError, setOauthError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const handleGoogleSignIn = async () => {
    setOauthError(null);
    setGoogleLoading(true);
    try {
      const { error: err } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: window.location.origin + "/auth/callback",
        },
      });
      if (err) setOauthError(err.message);
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (mode === "signin") {
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (signInError) throw signInError;
        router.push("/dashboard");
        router.refresh();
      } else {
        const { error: signUpError } = await supabase.auth.signUp({
          email,
          password,
        });
        if (signUpError) throw signUpError;
        setEmailSent(true);
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const outerWrapperStyle: React.CSSProperties = {
    minHeight: "100vh",
    background: "#08090a",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
    position: "relative",
    overflow: "hidden",
    fontFamily: "Inter, -apple-system, sans-serif",
  };

  const cardStyle: React.CSSProperties = {
    position: "relative",
    zIndex: 10,
    width: "100%",
    maxWidth: 400,
    background: "rgba(11,11,15,0.92)",
    backdropFilter: "blur(40px) saturate(150%)",
    WebkitBackdropFilter: "blur(40px) saturate(150%)",
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: 14,
    padding: 32,
    boxShadow: "0 0 0 1px rgba(255,255,255,0.03) inset, 0 32px 80px rgba(0,0,0,0.5)",
  };

  const inputStyle: React.CSSProperties = {
    width: "100%",
    padding: "11px 14px",
    borderRadius: 8,
    background: "rgba(255,255,255,0.04)",
    border: "1px solid rgba(255,255,255,0.08)",
    color: "#F2F2F2",
    fontSize: 14,
    fontFamily: "Inter, sans-serif",
    outline: "none",
    transition: "border-color 0.15s, background 0.15s",
    boxSizing: "border-box",
  };

  const labelStyle: React.CSSProperties = {
    display: "block",
    fontSize: 12,
    fontWeight: 500,
    color: "#525252",
    marginBottom: 6,
    fontFamily: "Inter, sans-serif",
    letterSpacing: "0.03em",
    textTransform: "uppercase",
  };

  const errorBoxStyle: React.CSSProperties = {
    background: "rgba(239,68,68,0.08)",
    border: "1px solid rgba(239,68,68,0.2)",
    borderRadius: 8,
    padding: "10px 14px",
    fontSize: 13,
    color: "#fca5a5",
    fontFamily: "Inter, sans-serif",
  };

  if (emailSent) {
    return (
      <div style={outerWrapperStyle}>
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Instrument+Serif:ital,wght@0,400;1,400&family=Inter:wght@400;500;600;700&display=swap');
          * { box-sizing: border-box; }
        `}</style>

        {/* Background layers */}
        <div style={{ position: "absolute", inset: 0, pointerEvents: "none", zIndex: 0 }}>
          <div style={{
            position: "absolute", inset: 0,
            background: "radial-gradient(ellipse 60% 40% at 50% 0%, rgba(99,102,241,0.18) 0%, transparent 65%)",
          }} />
          <div style={{
            position: "absolute", width: "100%", height: "100%",
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px)",
            backgroundSize: "80px 80px",
          }} />
        </div>

        <div style={{ ...cardStyle, textAlign: "center" }}>
          {/* Icon */}
          <div style={{
            width: 56, height: 56,
            background: "rgba(99,102,241,0.1)",
            border: "1px solid rgba(99,102,241,0.2)",
            borderRadius: 12,
            display: "flex", alignItems: "center", justifyContent: "center",
            margin: "0 auto 20px",
          }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#6366f1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 13a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/>
            </svg>
          </div>

          <h2 style={{
            fontFamily: "'Instrument Serif', Georgia, serif",
            fontStyle: "italic",
            fontSize: 24,
            color: "#F2F2F2",
            letterSpacing: "-0.02em",
            marginBottom: 8,
          }}>
            Check your inbox.
          </h2>

          <p style={{ fontSize: 14, color: "#8a8f98", lineHeight: 1.7, marginBottom: 4 }}>
            We sent a confirmation link to
          </p>
          <p style={{ fontSize: 14, color: "#818cf8", fontWeight: 600, marginBottom: 20 }}>
            {email}
          </p>

          <p style={{ fontSize: 12, color: "#3f3f46", lineHeight: 1.6, marginBottom: 24 }}>
            Click the link in the email to activate your account. Check your spam folder if you don&apos;t see it within a minute.
          </p>

          {oauthError && (
            <div style={{ ...errorBoxStyle, marginBottom: 16 }} role="alert">
              {oauthError}
            </div>
          )}

          <button
            type="button"
            onClick={() => setEmailSent(false)}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              fontSize: 13,
              color: "#3f3f46",
              fontFamily: "Inter, sans-serif",
              transition: "color 0.15s",
              padding: 0,
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "#8a8f98")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "#3f3f46")}
          >
            ← Use a different email
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={outerWrapperStyle}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Instrument+Serif:ital,wght@0,400;1,400&family=Inter:wght@400;500;600;700&display=swap');
        *, *::before, *::after { box-sizing: border-box; }
        .auth-input:focus {
          border-color: rgba(99,102,241,0.5) !important;
          background: rgba(255,255,255,0.06) !important;
          outline: none;
        }
        .auth-input::placeholder { color: #3f3f46; }
        .auth-google-btn:hover { background: rgba(255,255,255,0.1) !important; }
        .auth-back:hover { color: #8a8f98 !important; }
        .auth-submit:hover:not(:disabled) { opacity: 0.88 !important; }
        .auth-tab-inactive:hover { color: #8a8f98 !important; }
        @keyframes arrowBounce {
          0%, 100% { transform: translateY(0px); opacity: 1; }
          50% { transform: translateY(4px); opacity: 0.6; }
        }
        @keyframes recommendPulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.7; }
        }
      `}</style>

      {/* Background layers */}
      <div style={{ position: "absolute", inset: 0, pointerEvents: "none", zIndex: 0 }}>
        <div style={{
          position: "absolute", inset: 0,
          background: "radial-gradient(ellipse 60% 40% at 50% 0%, rgba(99,102,241,0.18) 0%, transparent 65%)",
        }} />
        <div style={{
          position: "absolute", width: "100%", height: "100%",
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px)",
          backgroundSize: "80px 80px",
        }} />
      </div>

      <div style={cardStyle}>

        {/* Logo */}
        <div style={{ marginBottom: 28 }}>
          <Link href="/" style={{ textDecoration: "none", display: "inline-flex", alignItems: "center" }}>
            <span style={{
              fontFamily: "'Instrument Serif', Georgia, serif",
              fontStyle: "italic",
              fontSize: 22,
              color: "#F2F2F2",
              letterSpacing: "-0.02em",
            }}>
              Zyph
            </span>
            <span style={{
              display: "inline-block",
              width: 6, height: 6,
              background: "#6366f1",
              borderRadius: "50%",
              marginLeft: 3, marginBottom: 1,
              verticalAlign: "middle",
            }} />
          </Link>
        </div>

        {/* Tagline */}
        <p style={{ fontSize: 13, color: "#525252", marginBottom: 24, fontFamily: "Inter, sans-serif" }}>
          Sign in or create an account to continue.
        </p>

        {/* Google button */}
        <button
          type="button"
          onClick={handleGoogleSignIn}
          disabled={googleLoading}
          className="auth-google-btn"
          style={{
            width: "100%",
            padding: "11px 16px",
            borderRadius: 8,
            background: "rgba(255,255,255,0.06)",
            border: "1px solid rgba(255,255,255,0.1)",
            color: "#F2F2F2",
            fontSize: 14,
            fontWeight: 500,
            fontFamily: "Inter, sans-serif",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 10,
            cursor: googleLoading ? "not-allowed" : "pointer",
            opacity: googleLoading ? 0.5 : 1,
            transition: "background 0.15s",
            marginBottom: 20,
          }}
        >
          <GoogleIcon />
          <span>{googleLoading ? "Redirecting…" : "Continue with Google"}</span>
        </button>

        {oauthError && (
          <div style={{ ...errorBoxStyle, marginBottom: 16 }} role="alert">
            {oauthError}
          </div>
        )}

        {/* Divider */}
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
          <div style={{ flex: 1, height: 1, background: "rgba(255,255,255,0.06)" }} />
          <span style={{ fontSize: 12, color: "#3f3f46", fontFamily: "Inter, sans-serif", whiteSpace: "nowrap" }}>
            or continue with email
          </span>
          <div style={{ flex: 1, height: 1, background: "rgba(255,255,255,0.06)" }} />
        </div>

        {/* Recommended pill */}
        {mode === "signin" && (
          <div style={{
            display: "flex",
            justifyContent: "center",
            marginBottom: "12px",
            animation: "recommendPulse 2s ease-in-out infinite",
          }}>
            <div style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              background: "rgba(99,102,241,0.08)",
              border: "1px solid rgba(99,102,241,0.18)",
              borderRadius: "99px",
              padding: "4px 12px 4px 8px",
            }}>
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#6366f1"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                style={{ animation: "arrowBounce 1.2s ease-in-out infinite", flexShrink: 0 }}
              >
                <path d="M12 5v14M5 12l7 7 7-7"/>
              </svg>
              <span style={{
                fontSize: "12px",
                fontWeight: 600,
                color: "#818cf8",
                letterSpacing: "0.04em",
                fontFamily: "Inter, sans-serif",
              }}>
                use this one
              </span>
            </div>
          </div>
        )}

        {/* Mode toggle */}
        <div style={{
          background: "rgba(255,255,255,0.03)",
          border: "1px solid rgba(255,255,255,0.07)",
          borderRadius: 8,
          padding: 3,
          display: "flex",
          marginBottom: 20,
        }}>
          <button
            type="button"
            onClick={() => { setMode("signin"); setError(null); }}
            className={mode === "signin" ? undefined : "auth-tab-inactive"}
            style={{
              flex: 1,
              padding: 8,
              borderRadius: 6,
              fontSize: 13,
              fontWeight: 500,
              fontFamily: "Inter, sans-serif",
              border: "none",
              cursor: "pointer",
              transition: "background 0.15s, color 0.15s",
              background: mode === "signin" ? "rgba(99,102,241,0.15)" : "transparent",
              color: mode === "signin" ? "#818cf8" : "#525252",
              ...(mode === "signin" ? { border: "1px solid rgba(99,102,241,0.2)" } : {}),
            }}
          >
            Sign in
          </button>
          <button
            type="button"
            onClick={() => { setMode("signup"); setError(null); }}
            className={mode === "signup" ? undefined : "auth-tab-inactive"}
            style={{
              flex: 1,
              padding: 8,
              borderRadius: 6,
              fontSize: 13,
              fontWeight: 500,
              fontFamily: "Inter, sans-serif",
              border: "none",
              cursor: "pointer",
              transition: "background 0.15s, color 0.15s",
              background: mode === "signup" ? "rgba(99,102,241,0.15)" : "transparent",
              color: mode === "signup" ? "#818cf8" : "#525252",
              ...(mode === "signup" ? { border: "1px solid rgba(99,102,241,0.2)" } : {}),
            }}
          >
            Sign up
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: 16 }}>
            <label htmlFor="email" style={labelStyle}>Email</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              placeholder="you@example.com"
              className="auth-input"
              style={inputStyle}
            />
          </div>

          <div style={{ marginBottom: 16 }}>
            <label htmlFor="password" style={labelStyle}>Password</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete={mode === "signin" ? "current-password" : "new-password"}
              minLength={6}
              placeholder="••••••••"
              className="auth-input"
              style={inputStyle}
            />
          </div>

          {error && (
            <div style={{ ...errorBoxStyle, marginBottom: 16 }} role="alert">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="auth-submit"
            style={{
              width: "100%",
              padding: 12,
              borderRadius: 8,
              background: "#6366f1",
              color: "white",
              fontSize: 14,
              fontWeight: 600,
              fontFamily: "Inter, sans-serif",
              border: "none",
              cursor: loading ? "not-allowed" : "pointer",
              opacity: loading ? 0.5 : 1,
              boxShadow: "0 0 0 1px rgba(99,102,241,0.4), 0 8px 24px rgba(99,102,241,0.25)",
              transition: "opacity 0.15s",
              marginTop: 4,
            }}
          >
            {loading ? "Please wait…" : mode === "signin" ? "Sign in" : "Sign up"}
          </button>
        </form>

        {/* Back to home */}
        <div style={{ marginTop: 20, textAlign: "center" }}>
          <Link
            href="/"
            className="auth-back"
            style={{ fontSize: 13, color: "#3f3f46", textDecoration: "none", transition: "color 0.15s" }}
          >
            ← Back to home
          </Link>
        </div>

      </div>
    </div>
  );
}
