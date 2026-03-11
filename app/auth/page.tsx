"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

const glassCard = {
  background: "rgba(255,255,255,0.04)",
  border: "1px solid rgba(255,255,255,0.08)",
  backdropFilter: "blur(24px)",
};

const glassInput = {
  background: "rgba(0,0,0,0.3)",
  border: "1px solid rgba(255,255,255,0.1)",
};

export default function AuthPage() {
  const router = useRouter();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

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
      } else {
        const { error: signUpError } = await supabase.auth.signUp({
          email,
          password,
        });
        if (signUpError) throw signUpError;
      }
      router.push("/dashboard");
      router.refresh();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

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
