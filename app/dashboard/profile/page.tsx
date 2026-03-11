"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

const glassCard = {
  background: "rgba(255,255,255,0.04)",
  border: "1px solid rgba(255,255,255,0.08)",
  backdropFilter: "blur(24px)",
};

type ProfileRow = { id: string; name: string | null } | null;
type ObservationRow = {
  id: string;
  created_at: string;
  app_name?: string | null;
  description?: string | null;
};
type InsightRow = {
  id: string;
  type?: string | null;
  category?: string | null;
  content?: string | null;
  summary?: string | null;
  confidence?: number | null;
  updated_at?: string;
};

export default function ProfilePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<ProfileRow>(null);
  const [observations, setObservations] = useState<ObservationRow[]>([]);
  const [insights, setInsights] = useState<InsightRow[]>([]);
  const [totalObservations, setTotalObservations] = useState(0);
  const [daysObserved, setDaysObserved] = useState(0);
  const [confidenceAvg, setConfidenceAvg] = useState<number | null>(null);
  const [clearModalOpen, setClearModalOpen] = useState(false);
  const [clearing, setClearing] = useState(false);

  useEffect(() => {
    const fetch = async () => {
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
            supabase.from("profiles").select("id, name").eq("id", user.id).single(),
            supabase
              .from("observations")
              .select("id, created_at, app_name, description")
              .eq("user_id", user.id)
              .order("created_at", { ascending: false })
              .limit(20),
            supabase
              .from("user_profile_insights")
              .select("id, type, category, content, summary, confidence, updated_at")
              .eq("user_id", user.id),
            supabase
              .from("observations")
              .select("id", { count: "exact", head: true })
              .eq("user_id", user.id),
          ]);

        if (profileRes.data) setProfile(profileRes.data as ProfileRow);
        if (observationsRes.data)
          setObservations((observationsRes.data as ObservationRow[]) || []);
        if (insightsRes.data)
          setInsights((insightsRes.data as InsightRow[]) || []);

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
          setDaysObserved(dates.size);
        }

        const withConf = (insightsRes.data as InsightRow[])?.filter(
          (i) => i.confidence != null
        ) || [];
        if (withConf.length) {
          const avg =
            withConf.reduce((s, i) => s + Number(i.confidence), 0) /
            withConf.length;
          setConfidenceAvg(Math.round(avg * 100) / 100);
        }
      } catch {
        // tables may not exist
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [router]);

  const handleClearData = async () => {
    setClearing(true);
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      setClearing(false);
      setClearModalOpen(false);
      return;
    }
    try {
      await supabase.from("observations").delete().eq("user_id", user.id);
      await supabase.from("user_profile_insights").delete().eq("user_id", user.id);
      setObservations([]);
      setInsights([]);
      setTotalObservations(0);
      setDaysObserved(0);
      setConfidenceAvg(null);
      setClearModalOpen(false);
    } catch {
      // show error in modal if needed
    } finally {
      setClearing(false);
    }
  };

  const groupedByCategory = insights.reduce<Record<string, InsightRow[]>>(
    (acc, i) => {
      const key = i.category || i.type || "General";
      if (!acc[key]) acc[key] = [];
      acc[key].push(i);
      return acc;
    },
    {}
  );

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

  const initial = profile?.name?.[0]?.toUpperCase() || "?";

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
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-8">
          Your Zyph Profile
        </h1>

        <div className="flex flex-col md:flex-row gap-8 mb-10">
          <div
            className="w-24 h-24 rounded-full flex items-center justify-center text-3xl font-bold text-white shrink-0"
            style={{
              background: "linear-gradient(135deg, #7c3aed 0%, #e8837a 100%)",
              boxShadow: "0 8px 32px rgba(124,58,237,0.3)",
            }}
          >
            {initial}
          </div>

          <div
            className="rounded-2xl p-6 flex-1"
            style={glassCard}
          >
            <h2 className="text-lg font-semibold text-white mb-4">Identity</h2>
            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
              <div>
                <dt className="text-white/50">Name</dt>
                <dd className="text-white font-medium">
                  {profile?.name || "—"}
                </dd>
              </div>
              <div>
                <dt className="text-white/50">Days observed</dt>
                <dd className="text-white font-medium">{daysObserved}</dd>
              </div>
              <div>
                <dt className="text-white/50">Total observations</dt>
                <dd className="text-white font-medium">
                  {totalObservations.toLocaleString()}
                </dd>
              </div>
              <div>
                <dt className="text-white/50">Confidence avg</dt>
                <dd className="text-white font-medium">
                  {confidenceAvg != null ? `${(confidenceAvg * 100).toFixed(0)}%` : "—"}
                </dd>
              </div>
            </dl>
          </div>
        </div>

        {Object.keys(groupedByCategory).length > 0 && (
          <section className="mb-10">
            <h2 className="text-lg font-semibold text-white mb-4">
              Insight categories
            </h2>
            <div className="space-y-4">
              {Object.entries(groupedByCategory).map(([category, items]) => {
                const avgConf =
                  items.filter((i) => i.confidence != null).length > 0
                    ? items.reduce((s, i) => s + (Number(i.confidence) ?? 0), 0) /
                      items.filter((i) => i.confidence != null).length
                    : 0;
                const pct = Math.min(100, Math.round(avgConf * 100));
                return (
                  <div
                    key={category}
                    className="rounded-2xl p-5"
                    style={glassCard}
                  >
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-white font-medium">{category}</span>
                      <span className="text-white/50 text-sm">
                        {pct}% confidence
                      </span>
                    </div>
                    <div
                      className="h-2 rounded-full overflow-hidden"
                      style={{
                        background: "rgba(255,255,255,0.08)",
                      }}
                    >
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${pct}%`,
                          background:
                            "linear-gradient(90deg, #7c3aed 0%, #e8837a 100%)",
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        <section className="mb-10">
          <h2 className="text-lg font-semibold text-white mb-4">
            Recent observations
          </h2>
          <div className="rounded-2xl p-6" style={glassCard}>
            {observations.length === 0 ? (
              <p className="text-white/40 text-sm">
                No observations yet. Use the desktop app to start.
              </p>
            ) : (
              <ul className="relative space-y-0">
                <span
                  className="absolute left-[5px] top-2 bottom-2 w-0.5 rounded-full"
                  style={{ background: "rgba(124,58,237,0.4)" }}
                />
                {observations.map((obs) => (
                  <li
                    key={obs.id}
                    className="relative flex gap-4 pl-8 pb-6 last:pb-0"
                  >
                    <span
                      className="absolute left-0 top-1.5 w-3 h-3 rounded-full shrink-0"
                      style={{
                        background: "#7c3aed",
                        boxShadow: "0 0 8px rgba(124,58,237,0.6)",
                      }}
                    />
                    <div className="min-w-0">
                      <p className="text-white/70 text-sm">
                        {obs.app_name && (
                          <span className="font-medium">{obs.app_name}</span>
                        )}
                        {obs.description && (
                          <span className="text-white/50"> — {obs.description}</span>
                        )}
                      </p>
                      <p className="text-white/40 text-xs mt-0.5">
                        {new Date(obs.created_at).toLocaleString()}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>

        <div className="pt-4">
          <button
            type="button"
            onClick={() => setClearModalOpen(true)}
            className="px-5 py-2.5 rounded-xl text-sm font-medium text-white border border-red-500/50 bg-red-500/10 hover:bg-red-500/20 transition-colors"
          >
            Clear my data
          </button>
        </div>
      </div>

      {clearModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(8px)" }}
          onClick={() => !clearing && setClearModalOpen(false)}
        >
          <div
            className="rounded-2xl p-6 max-w-md w-full shadow-xl"
            style={glassCard}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-semibold text-white mb-2">
              Clear all my data?
            </h3>
            <p className="text-white/60 text-sm mb-6">
              This will permanently delete your observations and profile
              insights. This cannot be undone.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                type="button"
                onClick={() => setClearModalOpen(false)}
                disabled={clearing}
                className="px-4 py-2 rounded-xl text-white/80 hover:bg-white/10 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleClearData}
                disabled={clearing}
                className="px-4 py-2 rounded-xl bg-red-500/20 text-red-400 border border-red-500/40 hover:bg-red-500/30 disabled:opacity-50 transition-colors"
              >
                {clearing ? "Clearing…" : "Yes, clear everything"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
