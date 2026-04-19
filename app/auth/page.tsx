"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createSupabaseBrowserClient } from "@/lib/supabase";

const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Instrument+Serif:ital,wght@0,400;1,400&family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;600&display=swap');

  *, *::before, *::after { box-sizing: border-box; }
  html, body { margin: 0; padding: 0; }

  .auth-root {
    position: relative;
    min-height: 100vh;
    background: #08090a;
    color: #F2F2F2;
    font-family: 'Inter', system-ui, -apple-system, sans-serif;
    -webkit-font-smoothing: antialiased;
    overflow-x: hidden;
  }
  .auth-root a { color: inherit; text-decoration: none; }

  /* Background */
  .bg-layers { position: absolute; inset: 0; pointer-events: none; z-index: 0; }
  .bg-indigo {
    position: absolute; inset: 0;
    background: radial-gradient(ellipse 60% 45% at 50% -5%, rgba(99,102,241,0.22) 0%, transparent 65%);
  }
  .bg-orange {
    position: absolute; inset: 0;
    background: radial-gradient(ellipse 40% 30% at 90% 95%, rgba(249,115,22,0.06) 0%, transparent 60%);
  }
  .bg-grid {
    position: absolute; inset: 0;
    background-image:
      linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px),
      linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px);
    background-size: 80px 80px;
    mask-image: radial-gradient(ellipse 80% 70% at 50% 40%, #000 40%, transparent 85%);
    -webkit-mask-image: radial-gradient(ellipse 80% 70% at 50% 40%, #000 40%, transparent 85%);
  }
  .bg-noise {
    position: absolute; inset: 0; opacity: 0.35;
    background-image: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='200' height='200'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 0.04 0'/></filter><rect width='200' height='200' filter='url(%23n)'/></svg>");
  }

  /* Chrome bar */
  .chrome {
    position: absolute; top: 0; left: 0; right: 0;
    display: flex; align-items: center; justify-content: space-between;
    padding: 22px 28px; z-index: 5;
    font-size: 12px; color: #525252;
  }
  .chrome-mono { font-family: 'JetBrains Mono', monospace; letter-spacing: 0.1em; text-transform: uppercase; display: inline-flex; align-items: center; gap: 6px; transition: color .15s; }
  .chrome-mono:hover { color: #F2F2F2; }
  .chrome-right { display: flex; align-items: center; gap: 18px; }
  .chrome-link { transition: color .15s; font-family: 'JetBrains Mono', monospace; letter-spacing: 0.1em; text-transform: uppercase; font-size: 12px; color: #525252; }
  .chrome-link:hover { color: #F2F2F2; }
  .status-dot {
    display: inline-flex; align-items: center; gap: 6px;
    color: #86efac; font-size: 11px;
  }
  .status-dot::before {
    content: ""; width: 5px; height: 5px; background: #22c55e; border-radius: 50%;
    box-shadow: 0 0 8px #22c55e; animation: pulseDot 2.2s ease-in-out infinite;
  }

  /* Stage */
  .stage {
    position: relative; z-index: 2;
    min-height: 100vh;
    display: grid;
    place-items: center;
    padding: 32px 24px;
  }

  /* Shell – centered variant */
  .shell {
    width: 100%;
    max-width: 440px;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 32px;
  }

  /* Brand */
  .brand-side {
    display: flex; flex-direction: column;
    align-items: center; text-align: center;
    gap: 10px;
  }
  .brand-mark { display: inline-flex; align-items: center; gap: 6px; }
  .brand-word { font-family: 'Instrument Serif', Georgia, serif; font-style: italic; font-weight: 400; font-size: 34px; color: #F2F2F2; letter-spacing: -0.02em; line-height: 1; }
  .brand-dot {
    width: 8px; height: 8px; background: #6366f1; border-radius: 50%;
    margin-bottom: 4px; box-shadow: 0 0 14px rgba(99,102,241,0.8);
  }
  .eyebrow {
    display: inline-flex; align-items: center; gap: 8px;
    background: rgba(99,102,241,0.07);
    border: 1px solid rgba(99,102,241,0.22);
    border-radius: 99px;
    padding: 5px 12px 5px 10px;
    font-size: 11px; font-weight: 500;
    color: #c7d2fe; letter-spacing: 0.08em; text-transform: uppercase;
    width: fit-content; margin-top: 4px;
  }
  .eyebrow::before {
    content: ""; width: 5px; height: 5px; background: #818cf8; border-radius: 50%;
    box-shadow: 0 0 8px #818cf8; animation: pulseDot 2.5s ease-in-out infinite;
  }

  /* Card */
  .card {
    width: 100%;
    max-width: 440px;
    background: linear-gradient(180deg, rgba(13,13,18,0.96), rgba(9,9,14,0.96));
    backdrop-filter: blur(40px) saturate(160%);
    -webkit-backdrop-filter: blur(40px) saturate(160%);
    border: 1px solid rgba(255,255,255,0.08);
    border-radius: 16px;
    padding: 36px;
    box-shadow:
      0 0 0 1px rgba(255,255,255,0.03) inset,
      0 32px 80px rgba(0,0,0,0.5),
      0 0 80px rgba(99,102,241,0.08);
    animation: fadeUp .6s cubic-bezier(.19,1,.22,1) both;
  }
  .card-head {
    display: flex; align-items: center; justify-content: space-between;
    margin-bottom: 22px;
  }
  .mini-logo { display: inline-flex; align-items: center; gap: 4px; }
  .mini-word { font-family: 'Instrument Serif', Georgia, serif; font-style: italic; font-weight: 400; font-size: 18px; color: #F2F2F2; letter-spacing: -0.02em; line-height: 1; }
  .mini-dot {
    width: 5px; height: 5px; background: #6366f1; border-radius: 50%;
    margin-bottom: 2px; box-shadow: 0 0 8px rgba(99,102,241,0.9);
  }
  .card-status {
    display: inline-flex; align-items: center; gap: 6px;
    font-size: 10.5px; color: #6b7280; letter-spacing: 0.08em; text-transform: uppercase;
  }
  .card-status::before {
    content: ""; width: 6px; height: 6px; border-radius: 50%;
    background: #22c55e; box-shadow: 0 0 8px #22c55e;
    animation: pulseDot 2s ease-in-out infinite;
  }
  .card-title {
    font-family: 'Instrument Serif', Georgia, serif; font-style: italic; font-weight: 400;
    font-size: 22px; color: #F2F2F2; letter-spacing: -0.015em;
    margin-bottom: 4px;
  }
  .card-sub {
    font-size: 13.5px; color: #8a8f98; line-height: 1.55;
    margin-bottom: 26px;
  }

  /* Buttons */
  .btn {
    display: inline-flex; align-items: center; justify-content: center;
    gap: 10px; width: 100%;
    padding: 12px 16px;
    font-family: 'Inter', sans-serif;
    font-size: 14px; font-weight: 500;
    border-radius: 10px;
    border: 1px solid transparent;
    cursor: pointer;
    transition: transform .12s ease, background .15s, border-color .15s, box-shadow .15s, opacity .15s;
    user-select: none;
  }
  .btn-google {
    background: #ffffff; color: #0a0a0f;
    border-color: rgba(255,255,255,0.2);
    font-weight: 600;
    box-shadow: 0 1px 0 rgba(255,255,255,0.2) inset, 0 10px 30px rgba(0,0,0,0.4);
  }
  .btn-google:hover:not(:disabled) { background: #f7f7f9; transform: translateY(-1px); }
  .btn-google:active { transform: translateY(0); }
  .btn-google:disabled { opacity: 0.55; cursor: not-allowed; }
  .btn-primary {
    background: #6366f1; color: #ffffff;
    border-color: rgba(255,255,255,0.12);
    font-weight: 600;
    box-shadow: 0 0 0 1px rgba(99,102,241,0.45), 0 10px 30px rgba(99,102,241,0.3), inset 0 1px 0 rgba(255,255,255,0.2);
    margin-top: 2px;
  }
  .btn-primary:hover:not(:disabled) { transform: translateY(-1px); box-shadow: 0 0 0 1px rgba(99,102,241,0.6), 0 14px 36px rgba(99,102,241,0.4), inset 0 1px 0 rgba(255,255,255,0.25); }
  .btn-primary:active { transform: translateY(0); }
  .btn-primary:disabled { opacity: 0.55; cursor: not-allowed; transform: none; }

  /* Divider */
  .divider {
    display: flex; align-items: center; gap: 12px;
    margin: 22px 0;
  }
  .div-line { flex: 1; height: 1px; background: rgba(255,255,255,0.07); }
  .div-lbl { font-size: 11.5px; color: #525252; letter-spacing: 0.02em; white-space: nowrap; }

  /* Error */
  .error-box {
    display: flex; align-items: center; gap: 8px;
    background: rgba(239,68,68,0.08);
    border: 1px solid rgba(239,68,68,0.22);
    border-radius: 8px;
    padding: 10px 14px;
    font-size: 12.5px; color: #fca5a5;
    margin-bottom: 14px;
    animation: shake .35s ease;
  }

  /* Form fields */
  .field { margin-bottom: 14px; }
  .field-label {
    display: flex; align-items: center; justify-content: space-between;
    font-size: 10.5px; font-weight: 600; color: #6b7280;
    letter-spacing: 0.12em; text-transform: uppercase;
    margin-bottom: 8px;
  }
  .input-wrap { position: relative; display: flex; align-items: center; }
  .input-icon {
    position: absolute; left: 13px; top: 50%; transform: translateY(-50%);
    color: #525252; pointer-events: none; transition: color .15s;
  }
  .input-field {
    width: 100%;
    padding: 12px 14px 12px 40px;
    background: rgba(255,255,255,0.035);
    border: 1px solid rgba(255,255,255,0.08);
    border-radius: 10px;
    color: #F2F2F2;
    font-family: 'Inter', sans-serif;
    font-size: 14px;
    outline: none;
    transition: border-color .15s, background .15s, box-shadow .15s;
  }
  .input-field::placeholder { color: #3f3f46; }
  .input-field:hover { border-color: rgba(255,255,255,0.12); }
  .input-field:focus {
    border-color: rgba(99,102,241,0.55);
    background: rgba(99,102,241,0.04);
    box-shadow: 0 0 0 3px rgba(99,102,241,0.14);
  }
  .reveal-btn {
    position: absolute; right: 10px; top: 50%; transform: translateY(-50%);
    background: none; border: none; cursor: pointer; padding: 6px; border-radius: 6px;
    color: #525252; transition: color .15s, background .15s;
  }
  .reveal-btn:hover { color: #F2F2F2; background: rgba(255,255,255,0.05); }

  /* Remember row */
  .remember-row {
    display: flex; align-items: center;
    margin: 4px 0 18px;
  }
  .check-label {
    display: inline-flex; align-items: center; gap: 8px;
    font-size: 12.5px; color: #8a8f98; cursor: pointer; user-select: none;
  }
  .check-label input { position: absolute; opacity: 0; pointer-events: none; }
  .check-box {
    width: 15px; height: 15px; border-radius: 4px;
    background: rgba(255,255,255,0.03);
    border: 1px solid rgba(255,255,255,0.14);
    display: inline-flex; align-items: center; justify-content: center;
    flex-shrink: 0;
  }
  .check-box-checked {
    background: #6366f1; border-color: #6366f1;
    box-shadow: 0 0 0 3px rgba(99,102,241,0.15);
  }

  /* Footer */
  .card-foot {
    margin-top: 22px;
    font-size: 13px; color: #6b7280;
    text-align: center;
  }
  .card-foot-link {
    color: #818cf8; font-weight: 500;
    border-bottom: 1px solid rgba(129,140,248,0.3);
    transition: color .15s, border-color .15s;
    cursor: pointer; background: none; border-top: none; border-left: none; border-right: none;
    font-family: inherit; font-size: inherit; padding: 0;
  }
  .card-foot-link:hover { color: #a5b4fc; border-bottom-color: rgba(165,180,252,0.6); }

  .card-legal {
    margin-top: 16px;
    font-size: 11px; color: #3f3f46; line-height: 1.6;
    text-align: center;
  }
  .card-legal a { color: #52525b; border-bottom: 1px dotted rgba(82,82,91,0.4); }
  .card-legal a:hover { color: #8a8f98; }

  /* Success state (email sent) */
  .success-card { text-align: center; }
  .success-icon {
    width: 56px; height: 56px; margin: 0 auto 16px;
    border-radius: 14px;
    background: rgba(99,102,241,0.1);
    border: 1px solid rgba(99,102,241,0.25);
    display: flex; align-items: center; justify-content: center;
    color: #818cf8;
  }

  /* Keyframes */
  @keyframes fadeUp { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
  @keyframes pulseDot { 0%,100% { opacity: 1; transform: scale(1); } 50% { opacity: 0.45; transform: scale(0.8); } }
  @keyframes shake { 0%,100% { transform: translateX(0); } 25% { transform: translateX(-4px); } 75% { transform: translateX(4px); } }

  @media (max-width: 520px) {
    .card { padding: 28px 22px; }
    .chrome { padding: 16px 18px; font-size: 11px; }
    .chrome-right { gap: 12px; }
  }
`;

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
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(true);

  const handleGoogleSignIn = async () => {
    setOauthError(null);
    setGoogleLoading(true);
    try {
      const { error: err } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: { redirectTo: window.location.origin + "/auth/callback" },
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
        const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
        if (signInError) throw signInError;
        router.push("/dashboard");
        router.refresh();
      } else {
        const { error: signUpError } = await supabase.auth.signUp({ email, password });
        if (signUpError) throw signUpError;
        setEmailSent(true);
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  if (emailSent) {
    return (
      <div className="auth-root">
        <style>{CSS}</style>
        <div className="bg-layers">
          <div className="bg-indigo" />
          <div className="bg-orange" />
          <div className="bg-grid" />
          <div className="bg-noise" />
        </div>
        <main className="stage">
          <div className="shell">
            <div className="card success-card">
              <div className="success-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                  <polyline points="22,6 12,13 2,6" />
                </svg>
              </div>
              <h2 className="card-title" style={{ textAlign: "center", marginBottom: 8 }}>Check your inbox.</h2>
              <p style={{ fontSize: 14, color: "#8a8f98", lineHeight: 1.7, marginBottom: 4, textAlign: "center" }}>
                We sent a confirmation link to
              </p>
              <p style={{ fontSize: 14, color: "#818cf8", fontWeight: 600, marginBottom: 20, textAlign: "center" }}>
                {email}
              </p>
              <p style={{ fontSize: 12, color: "#3f3f46", lineHeight: 1.6, marginBottom: 24, textAlign: "center" }}>
                Click the link in the email to activate your account. Check your spam folder if you don&apos;t see it within a minute.
              </p>
              {oauthError && (
                <div className="error-box" role="alert" style={{ marginBottom: 16 }}>
                  <span>{oauthError}</span>
                </div>
              )}
              <button
                type="button"
                onClick={() => setEmailSent(false)}
                className="card-foot-link"
                style={{ display: "block", margin: "0 auto", fontSize: 13, color: "#3f3f46", borderBottom: "none" }}
              >
                ← Use a different email
              </button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="auth-root">
      <style>{CSS}</style>

      <div className="bg-layers">
        <div className="bg-indigo" />
        <div className="bg-orange" />
        <div className="bg-grid" />
        <div className="bg-noise" />
      </div>

      <div className="chrome">
        <Link href="/" className="chrome-mono">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
          Back to zyph.app
        </Link>
        <div className="chrome-right">
          <span className="status-dot">All systems observing</span>
          <span className="chrome-link">v1.0.0</span>
        </div>
      </div>

      <main className="stage">
        <div className="shell">

          <div className="brand-side">
            <div className="brand-mark">
              <span className="brand-word">Zyph</span>
              <span className="brand-dot" />
            </div>
            <span className="eyebrow">Personal Intelligence · Beta</span>
          </div>

          <article className="card">
            <header className="card-head">
              <span className="mini-logo">
                <span className="mini-word">Zyph</span>
                <span className="mini-dot" />
              </span>
              <span className="card-status">Secure · TLS</span>
            </header>

            <h2 className="card-title">
              {mode === "signin" ? "Welcome back." : "Create your account."}
            </h2>
            <p className="card-sub">
              {mode === "signin"
                ? "Sign in to start learning from how you work."
                : "Join Zyph and start building your intelligence profile."}
            </p>

            {/* Google */}
            <button
              type="button"
              className="btn btn-google"
              onClick={handleGoogleSignIn}
              disabled={googleLoading}
            >
              <svg width="18" height="18" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
              <span>{googleLoading ? "Redirecting…" : "Continue with Google"}</span>
            </button>

            {oauthError && (
              <div className="error-box" role="alert" style={{ marginTop: 12 }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
                <span>{oauthError}</span>
              </div>
            )}

            <div className="divider">
              <span className="div-line" />
              <span className="div-lbl">or continue with email</span>
              <span className="div-line" />
            </div>

            {error && (
              <div className="error-box" role="alert">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} noValidate>
              <div className="field">
                <div className="field-label">
                  <span>Email</span>
                </div>
                <div className="input-wrap">
                  <svg className="input-icon" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                    <polyline points="22,6 12,13 2,6" />
                  </svg>
                  <input
                    className="input-field"
                    id="email"
                    type="email"
                    autoComplete="email"
                    placeholder="you@example.com"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>

              <div className="field">
                <div className="field-label">
                  <span>Password</span>
                  {mode === "signin" && (
                    <span style={{ textTransform: "none", letterSpacing: 0, fontWeight: 500, fontSize: 11.5, color: "#525252" }}>
                      Forgot?
                    </span>
                  )}
                </div>
                <div className="input-wrap">
                  <svg className="input-icon" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="11" width="18" height="11" rx="2" />
                    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                  </svg>
                  <input
                    className="input-field"
                    id="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete={mode === "signin" ? "current-password" : "new-password"}
                    placeholder="••••••••"
                    required
                    minLength={6}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    style={{ paddingRight: 40 }}
                  />
                  <button
                    type="button"
                    className="reveal-btn"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                        <line x1="1" y1="1" x2="23" y2="23" />
                      </svg>
                    ) : (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                        <circle cx="12" cy="12" r="3" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              <div className="remember-row">
                <label className="check-label" onClick={() => setRemember(!remember)}>
                  <span className={`check-box${remember ? " check-box-checked" : ""}`}>
                    {remember && (
                      <svg width="9" height="9" viewBox="0 0 10 10" fill="none">
                        <path d="M1.5 5l2.5 2.5 4.5-4.5" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    )}
                  </span>
                  Keep me signed in
                </label>
              </div>

              <button type="submit" className="btn btn-primary" disabled={loading}>
                <span>{loading ? "Please wait…" : mode === "signin" ? "Sign In" : "Create Account"}</span>
                {!loading && (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.25" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M5 12h14M13 6l6 6-6 6" />
                  </svg>
                )}
              </button>
            </form>

            <p className="card-foot">
              {mode === "signin" ? (
                <>No account?{" "}
                  <button
                    type="button"
                    className="card-foot-link"
                    onClick={() => { setMode("signup"); setError(null); }}
                  >
                    Create one
                  </button>
                </>
              ) : (
                <>Already have an account?{" "}
                  <button
                    type="button"
                    className="card-foot-link"
                    onClick={() => { setMode("signin"); setError(null); }}
                  >
                    Sign in
                  </button>
                </>
              )}
            </p>

            <p className="card-legal">
              By continuing you agree to Zyph&apos;s{" "}
              <Link href="/terms">Terms</Link> and{" "}
              <Link href="/privacy">Privacy Policy</Link>.
            </p>
          </article>

        </div>
      </main>
    </div>
  );
}
