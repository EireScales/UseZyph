"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createSupabaseBrowserClient } from "@/lib/supabase";

const glassCard = {
  background: "rgba(255,255,255,0.04)",
  border: "1px solid rgba(255,255,255,0.08)",
  backdropFilter: "blur(24px)",
};

const glassInput = {
  background: "rgba(0,0,0,0.3)",
  border: "1px solid rgba(255,255,255,0.1)",
};

const GoogleIcon = () => (
  <svg viewBox="0 0 24 24" width={20} height={20} className="shrink-0">
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

  if (emailSent) {
    return (
      <div
        className="min-h-screen bg-[#000000] flex items-center justify-center px-4"
        style={{
          backgroundImage: `
          linear-gradient(rgba(255,255,255,0.015) 1px, transparent 1px),
          linear-gradient(90deg, rgba(255,255,255,0.015) 1px, transparent 1px)
        `,
          backgroundSize: "80px 80px",
        }}
      >
        <div className="w-full max-w-md rounded-2xl p-8 shadow-2xl text-center" style={glassCard}>
          <div
            className="w-16 h-16 rounded-full mx-auto mb-6 flex items-center justify-center"
            style={{ background: "rgba(124,58,237,0.15)", border: "1px solid rgba(124,58,237,0.3)" }}
          >
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#7c3aed" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 13a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/>
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-white mb-3">Check your inbox</h2>
          <p className="text-white/50 text-sm leading-relaxed mb-2">
            We sent a confirmation link to
          </p>
          <p className="text-[#a78bfa] font-semibold text-sm mb-6">{email}</p>
          <p className="text-white/30 text-xs leading-relaxed mb-8">
            Click the link in the email to activate your account. Check your spam folder if you don&apos;t see it within a minute.
          </p>
          <button
            type="button"
            onClick={() => setEmailSent(false)}
            className="text-sm text-white/40 hover:text-white/60 transition-colors"
          >
            ← Use a different email
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen bg-[#000000] flex items-center justify-center px-4"
      style={{
        backgroundImage: `
          linear-gradient(rgba(255,255,255,0.015) 1px, transparent 1px),
          linear-gradient(90deg, rgba(255,255,255,0.015) 1px, transparent 1px)
        `,
        backgroundSize: "80px 80px",
      }}
    >
      <div
        className="w-full max-w-md rounded-2xl p-8 shadow-2xl"
        style={glassCard}
      >
        <Link href="/" className="inline-block mb-6">
          <h1 className="text-2xl font-bold text-white">Zyph</h1>
        </Link>
        <p className="text-white/50 text-sm mb-8">
          Sign in or create an account to get started.
        </p>

        <button
          type="button"
          onClick={handleGoogleSignIn}
          disabled={googleLoading}
          className="w-full flex items-center justify-center gap-3 py-3 rounded-xl bg-white text-[#1a1a1a] border border-[#e5e7eb] hover:bg-[#f9fafb] hover:border-[#d1d5db] disabled:opacity-50 transition-colors mb-6"
        >
          <GoogleIcon />
          <span>{googleLoading ? "Redirecting…" : "Continue with Google"}</span>
        </button>
        {oauthError && (
          <p className="text-sm text-[#e8837a] bg-[#e8837a]/10 border border-[#e8837a]/20 rounded-lg px-4 py-3 mb-6" role="alert">
            {oauthError}
          </p>
        )}

        <div className="relative mb-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-white/10" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-3 text-white/50" style={{ background: "rgba(255,255,255,0.04)" }}>or continue with email</span>
          </div>
        </div>

        <div className="flex rounded-lg p-1 mb-6" style={glassInput}>
          <button
            type="button"
            onClick={() => {
              setMode("signin");
              setError(null);
            }}
            className={`flex-1 py-2.5 rounded-md text-sm font-medium transition-colors ${
              mode === "signin"
                ? "bg-white/10 text-white"
                : "text-white/60 hover:text-white/80"
            }`}
          >
            Sign in
          </button>
          <button
            type="button"
            onClick={() => {
              setMode("signup");
              setError(null);
            }}
            className={`flex-1 py-2.5 rounded-md text-sm font-medium transition-colors ${
              mode === "signup"
                ? "bg-white/10 text-white"
                : "text-white/60 hover:text-white/80"
            }`}
          >
            Sign up
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-white/70 mb-2"
            >
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              className="w-full px-4 py-3 rounded-xl text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-[#7c3aed]/50 transition-all"
              style={glassInput}
              placeholder="you@example.com"
            />
          </div>
          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-white/70 mb-2"
            >
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete={mode === "signin" ? "current-password" : "new-password"}
              minLength={6}
              className="w-full px-4 py-3 rounded-xl text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-[#7c3aed]/50 transition-all"
              style={glassInput}
              placeholder="••••••••"
            />
          </div>

          {error && (
            <p
              className="text-sm text-[#e8837a] bg-[#e8837a]/10 border border-[#e8837a]/20 rounded-lg px-4 py-3"
              role="alert"
            >
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-xl font-semibold text-white disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:opacity-95"
            style={{
              background: "linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%)",
              boxShadow: "0 4px 20px rgba(124,58,237,0.35)",
            }}
          >
            {loading ? "Please wait…" : mode === "signin" ? "Sign in" : "Sign up"}
          </button>
        </form>

        <p className="mt-6 text-center text-white/40 text-sm">
          <Link href="/" className="hover:text-white/60 transition-colors">
            ← Back to home
          </Link>
        </p>
      </div>
    </div>
  );
}
