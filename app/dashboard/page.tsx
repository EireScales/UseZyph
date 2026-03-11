"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

const glassCard = {
  background: "rgba(255,255,255,0.04)",
  border: "1px solid rgba(255,255,255,0.08)",
  backdropFilter: "blur(24px)",
};

type Profile = { id: string; name: string | null } | null;
type Observation = {
  id: string;
  created_at: string;
  app_name?: string | null;
  description?: string | null;
  type?: string | null;
} | Record<string, unknown>;
type ProfileInsight = {
  id: string;
  content?: string | null;
  summary?: string | null;
  updated_at?: string;
} | Record<string, unknown>;

export default function DashboardPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<Profile>(null);
  const [observations, setObservations] = useState<Observation[]>([]);
  const [profileInsights, setProfileInsights] = useState<ProfileInsight[]>([]);
  const [totalObservations, setTotalObservations] = useState(0);
  const [daysActive, setDaysActive] = useState(0);
  const [insightsCount, setInsightsCount] = useState(0);
  const [topApp, setTopApp] = useState<string>("—");
  const [time, setTime] = useState<Date>(() => new Date());

  useEffect(() => {
    const checkSession = async () => {
      const {
        data: { user },
        error: sessionError,
      } = await supabase.auth.getUser();
      if (sessionError || !user) {
        router.replace("/auth");
        return;
      }

      try {
        const [profileRes, observationsRes, insightsRes, countRes] =
          await Promise.all([
            supabase
              .from("profiles")
              .select("id, name")
              .eq("id", user.id)
              .single(),
            supabase
              .from("observations")
              .select("id, created_at, app_name, description, type")
              .eq("user_id", user.id)
              .order("created_at", { ascending: false })
              .limit(10),
            supabase
              .from("user_profile_insights")
              .select("id, content, summary, updated_at")
              .eq("user_id", user.id)
              .order("updated_at", { ascending: false })
              .limit(5),
            supabase
              .from("observations")
              .select("id", { count: "exact", head: true })
              .eq("user_id", user.id),
          ]);

        if (profileRes.data) setProfile(profileRes.data as Profile);
        if (observationsRes.data)
          setObservations((observationsRes.data as Observation[]) || []);
        if (insightsRes.data)
          setProfileInsights((insightsRes.data as ProfileInsight[]) || []);
        if (countRes.count != null) setTotalObservations(countRes.count);

        const daysRes = await supabase
          .from("observations")
          .select("created_at")
          .eq("user_id", user.id)
          .limit(500);
        if (daysRes.data?.length) {
          const dates = new Set(
            (daysRes.data as { created_at: string }[]).map((o) =>
              o.created_at.slice(0, 10)
            )
          );
          setDaysActive(dates.size);
        }

        const insightsCountRes = await supabase
          .from("user_profile_insights")
          .select("id", { count: "exact", head: true })
          .eq("user_id", user.id);
        if (insightsCountRes.count != null)
          setInsightsCount(insightsCountRes.count);

        if (observationsRes.data?.length) {
          const apps = (observationsRes.data as { app_name?: string }[]).reduce(
            (acc: Record<string, number>, o) => {
              const app = o.app_name || "Unknown";
              acc[app] = (acc[app] || 0) + 1;
              return acc;
            },
            {}
          );
          const top = Object.entries(apps).sort((a, b) => b[1] - a[1])[0];
          if (top) setTopApp(top[0]);
        }
      } catch {
        // Tables may not exist yet; keep defaults
      } finally {
        setLoading(false);
      }
    };

    checkSession();
  }, [router]);

  useEffect(() => {
    const tick = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(tick);
  }, []);

  const greeting =
    time.getHours() < 12 ? "morning" : time.getHours() < 18 ? "afternoon" : "evening";
  const displayName = profile?.name?.trim() || "there";

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div
          className="h-10 w-10 animate-spin rounded-full border-2 border-[#7c3aed] border-t-transparent"
          aria-label="Loading"
        />
      </div>
    );
  }

  const statCards = [
    {
      label: "Total Observations",
      value: totalObservations.toLocaleString(),
      border: "#7c3aed",
    },
    {
      label: "Days Active",
      value: daysActive.toString(),
      border: "#e8837a",
    },
    {
      label: "Insights Generated",
      value: insightsCount.toString(),
      border: "#d4956a",
    },
    { label: "Top App Used", value: topApp, border: "#7c3aed" },
  ];

  return (
    <div
      className="min-h-screen p-8"
      style={{
        backgroundImage: `
          linear-gradient(rgba(255,255,255,0.015) 1px, transparent 1px),
          linear-gradient(90deg, rgba(255,255,255,0.015) 1px, transparent 1px)
        `,
        backgroundSize: "80px 80px",
      }}
    >
      <div className="max-w-6xl mx-auto">
        <header className="flex flex-wrap items-start justify-between gap-4 mb-10">
          <h1
            className="text-3xl lg:text-4xl font-bold"
            style={{
              background:
                "linear-gradient(180deg, #fff 0%, rgba(255,255,255,0.75) 50%, rgba(255,200,190,0.9) 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            Good {greeting}, {displayName}
          </h1>
          <div
            className="text-right tabular-nums text-white/80 font-medium"
            aria-live="polite"
          >
            {time.toLocaleTimeString("en-US", {
              hour: "2-digit",
              minute: "2-digit",
              second: "2-digit",
            })}
          </div>
        </header>

        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
          {statCards.map((stat) => (
            <div
              key={stat.label}
              className="rounded-2xl p-6 relative overflow-hidden"
              style={glassCard}
            >
              <div
                className="absolute top-0 left-0 right-0 h-1"
                style={{ background: stat.border }}
              />
              <p className="text-white/50 text-sm mb-1">
                {stat.label}
              </p>
              <p className="text-xl font-semibold text-white truncate">
                {stat.value}
              </p>
            </div>
          ))}
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="rounded-2xl p-6" style={glassCard}>
              <h2 className="text-lg font-semibold text-white mb-4">
                Recent Activity
              </h2>
              {observations.length === 0 ? (
                <p className="text-white/40 text-sm">
                  No observations yet. Use the desktop app to start.
                </p>
              ) : (
                <ul className="space-y-3">
                  {observations.map((obs) => {
                    const o = obs as {
                      id: string;
                      created_at: string;
                      app_name?: string;
                      description?: string;
                      type?: string;
                    };
                    return (
                      <li
                        key={o.id}
                        className="flex items-start gap-3 py-2 border-b border-white/5 last:border-0"
                      >
                        <span className="text-white/40 text-sm shrink-0">
                          {new Date(o.created_at).toLocaleString()}
                        </span>
                        <div className="min-w-0">
                          {o.app_name && (
                            <span className="text-white/70 font-medium">
                              {o.app_name}
                            </span>
                          )}
                          {o.description && (
                            <p className="text-white/50 text-sm truncate">
                              {o.description}
                            </p>
                          )}
                        </div>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>

            <div className="rounded-2xl p-6" style={glassCard}>
              <h2 className="text-lg font-semibold text-white mb-4">
                Your AI Profile
              </h2>
              {profileInsights.length === 0 ? (
                <p className="text-white/40 text-sm">
                  Complete onboarding and use Zyph to build your profile.
                </p>
              ) : (
                <ul className="space-y-3">
                  {profileInsights.map((insight) => {
                    const i = insight as {
                      id: string;
                      content?: string;
                      summary?: string;
                      updated_at?: string;
                    };
                    const text = i.content || i.summary || "";
                    return (
                      <li
                        key={i.id}
                        className="py-2 border-b border-white/5 last:border-0"
                      >
                        <p className="text-white/70 text-sm">{text}</p>
                        {i.updated_at && (
                          <span className="text-white/35 text-xs">
                            {new Date(i.updated_at).toLocaleDateString()}
                          </span>
                        )}
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          </div>

          <div>
            <Link
              href="/dashboard/chat"
              className="block rounded-2xl p-8 transition-opacity hover:opacity-95"
              style={{
                background:
                  "linear-gradient(135deg, rgba(232,131,122,0.2) 0%, rgba(212,149,106,0.15) 100%)",
                border: "1px solid rgba(232,131,122,0.25)",
                boxShadow: "0 8px 32px rgba(232,131,122,0.1)",
              }}
            >
              <h3 className="text-xl font-semibold text-white mb-2">
                Chat with Zyph
              </h3>
              <p className="text-white/60 text-sm mb-4">
                Ask anything. Your AI already knows your context.
              </p>
              <span
                className="inline-flex items-center gap-2 text-sm font-medium"
                style={{ color: "#e8837a" }}
              >
                Open Chat →
              </span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
