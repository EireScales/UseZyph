"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { createSupabaseBrowserClient } from "@/lib/supabase";
import { UpgradeModal } from "@/components/UpgradeModal";
import {
  defaultSubscription,
  isFreeTier,
  isTrialing,
  parseSubscriptionRow,
  startOfUtcDayIso,
  trialDaysRemaining,
  type SubscriptionRow,
} from "@/lib/subscription-shared";

type Profile = { id: string; name: string | null } | null;
type Observation = {
  id: string;
  captured_at: string;
  app_name?: string | null;
  summary?: string | null;
  category?: string | null;
} | Record<string, unknown>;
type ProfileInsight = {
  id: string;
  insight_value?: string | null;
  insight_type?: string | null;
  confidence_score?: number | null;
  updated_at?: string;
} | Record<string, unknown>;

function useCountUp(end: number, duration = 1200, enabled = true) {
  const [value, setValue] = useState(0);
  const startRef = useRef<number | null>(null);

  useEffect(() => {
    if (!enabled || typeof end !== "number") {
      setValue(end);
      return;
    }
    const isNumeric = Number.isFinite(end) && !Number.isNaN(end);
    if (!isNumeric) {
      setValue(0);
      return;
    }
    const start = 0;
    let rafId: number;
    const step = (ts: number) => {
      if (startRef.current == null) startRef.current = ts;
      const elapsed = ts - startRef.current;
      const t = Math.min(elapsed / duration, 1);
      const easeOut = 1 - Math.pow(1 - t, 3);
      setValue(Math.round(start + (end - start) * easeOut));
      if (t < 1) rafId = requestAnimationFrame(step);
    };
    rafId = requestAnimationFrame(step);
    return () => cancelAnimationFrame(rafId);
  }, [end, duration, enabled]);

  return value;
}

function DashboardContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createSupabaseBrowserClient();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<Profile>(null);
  const [observations, setObservations] = useState<Observation[]>([]);
  const [profileInsights, setProfileInsights] = useState<ProfileInsight[]>([]);
  const [totalObservations, setTotalObservations] = useState(0);
  const [daysActive, setDaysActive] = useState(0);
  const [insightsCount, setInsightsCount] = useState(0);
  const [topApp, setTopApp] = useState<string>("—");
  const [time, setTime] = useState<Date>(() => new Date());
  const [lastActiveDaysAgo, setLastActiveDaysAgo] = useState<number | null>(null);
  const [capturesToday, setCapturesToday] = useState(0);
  const [subscription, setSubscription] = useState<SubscriptionRow>(() =>
    defaultSubscription()
  );
  const [modalDismissed, setModalDismissed] = useState(false);
  const [storageRead, setStorageRead] = useState(false);
  const [fromDesktopLimit, setFromDesktopLimit] = useState(false);

  const countTotal = useCountUp(totalObservations, 1000, !loading);
  const countDays = useCountUp(daysActive, 1000, !loading);
  const countInsights = useCountUp(insightsCount, 1000, !loading);

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
        const dayStart = startOfUtcDayIso();
        const [profileRes, observationsRes, insightsRes, countRes, todayCountRes] =
          await Promise.all([
            supabase
              .from("profiles")
              .select("id, display_name, subscription")
              .eq("id", user.id)
              .single(),
            supabase
              .from("observations")
              .select("id, captured_at, app_name, summary, category")
              .eq("user_id", user.id)
              .order("captured_at", { ascending: false })
              .limit(10),
            supabase
              .from("user_profile_insights")
              .select("id, insight_value, insight_type, confidence_score, updated_at")
              .eq("user_id", user.id)
              .order("updated_at", { ascending: false })
              .limit(5),
            supabase
              .from("observations")
              .select("id", { count: "exact", head: true })
              .eq("user_id", user.id),
            supabase
              .from("observations")
              .select("id", { count: "exact", head: true })
              .eq("user_id", user.id)
              .gte("captured_at", dayStart),
          ]);

        if (profileRes.data) {
          const raw = profileRes.data as { id: string; display_name: string | null; subscription?: unknown };
          setProfile({ id: raw.id, name: raw.display_name });
          setSubscription(parseSubscriptionRow(raw.subscription));
        }
        if (todayCountRes.count != null) setCapturesToday(todayCountRes.count);
        if (observationsRes.data)
          setObservations((observationsRes.data as Observation[]) || []);
        if (insightsRes.data)
          setProfileInsights((insightsRes.data as ProfileInsight[]) || []);
        if (countRes.count != null) setTotalObservations(countRes.count);

        const daysRes = await supabase
          .from("observations")
          .select("captured_at")
          .eq("user_id", user.id)
          .limit(500);
        if (daysRes.data?.length) {
          const dates = new Set(
            (daysRes.data as { captured_at: string }[]).map((o) =>
              o.captured_at.slice(0, 10)
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

        const latestObs = observationsRes.data?.[0] as { captured_at?: string } | undefined;
        if (latestObs?.captured_at) {
          const last = new Date(latestObs.captured_at);
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          last.setHours(0, 0, 0, 0);
          setLastActiveDaysAgo(Math.floor((today.getTime() - last.getTime()) / (24 * 60 * 60 * 1000)));
        } else {
          setLastActiveDaysAgo(null);
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

  useEffect(() => {
    const urgent = searchParams.get("daily_limit") === "1";
    if (urgent) {
      setFromDesktopLimit(true);
      setModalDismissed(false);
      try {
        sessionStorage.removeItem("zyph_upgrade_modal_dismissed");
      } catch {
        /* private mode */
      }
      router.replace("/dashboard", { scroll: false });
    } else {
      try {
        if (sessionStorage.getItem("zyph_upgrade_modal_dismissed") === "1") {
          setModalDismissed(true);
        }
      } catch {
        /* ignore */
      }
    }
    setStorageRead(true);
  }, [searchParams, router]);

  const greeting =
    time.getHours() < 12 ? "morning" : time.getHours() < 18 ? "afternoon" : "evening";
  const displayName = profile?.name?.trim() || "there";

  const statCards = [
    {
      label: "Total Observations",
      value: countTotal.toLocaleString(),
      border: "#6366f1",
    },
    {
      label: "Days Active",
      value: countDays.toString(),
      border: "#f97316",
    },
    {
      label: "Insights Generated",
      value: countInsights.toString(),
      border: "#eab308",
    },
    { label: "Top App Used", value: topApp, border: "#22c55e" },
  ];

  const insightCategories: Record<string, ProfileInsight[]> = {};
  profileInsights.forEach((i) => {
    const cat = (i.insight_type || "General") as string;
    if (!insightCategories[cat]) insightCategories[cat] = [];
    insightCategories[cat].push(i);
  });

  const onFreePlan = isFreeTier(subscription);
  const trialing = isTrialing(subscription);
  const trialDaysLeft = trialDaysRemaining(subscription.trial_end);
  const trialEndsSoon =
    trialing && trialDaysLeft !== null && trialDaysLeft <= 3;

  if (loading) {
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
    <div style={{ padding: "32px 40px", fontFamily: "Inter, sans-serif" }}>

      <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
        <header style={{ display: "flex", flexWrap: "wrap", alignItems: "flex-start", justifyContent: "space-between", gap: 16, marginBottom: 20 }}>
          <h1
            style={{ fontSize: "28px", fontWeight: 700, color: "#F2F2F2", letterSpacing: "-0.02em", fontFamily: "'Instrument Serif', serif", fontStyle: "italic", margin: 0 }}
          >
            Good {greeting}, {displayName}
          </h1>
          <div
            style={{ color: "#3f3f46", fontSize: "13px", fontFamily: "monospace" }}
            aria-live="polite"
          >
            {time.toLocaleTimeString("en-US", {
              hour: "2-digit",
              minute: "2-digit",
              second: "2-digit",
            })}
          </div>
        </header>
        <div style={{ height: "1px", background: "rgba(255,255,255,0.05)", margin: "20px 0" }} />

        {trialing && trialEndsSoon && (
          <div
            style={{ marginBottom: 16, display: "flex", flexWrap: "wrap", gap: 12, borderRadius: 8, border: "1px solid rgba(249,115,22,0.15)", background: "rgba(249,115,22,0.06)", padding: "10px 16px", alignItems: "center", justifyContent: "space-between", fontSize: 13 }}
            role="status"
          >
            <p style={{ color: "#fb923c", margin: 0 }}>
              Your trial ends soon — upgrade to keep unlimited access.
            </p>
            <Link href="/pricing" style={{ color: "#fb923c", fontWeight: 600, textDecoration: "none", flexShrink: 0 }}>
              View plans →
            </Link>
          </div>
        )}

        {trialing && !trialEndsSoon && (
          <div
            style={{ marginBottom: 16, display: "flex", flexWrap: "wrap", gap: 12, borderRadius: 8, border: "1px solid rgba(99,102,241,0.15)", background: "rgba(99,102,241,0.06)", padding: "10px 16px", alignItems: "center", justifyContent: "space-between", fontSize: 13 }}
            role="status"
          >
            <p style={{ color: "#818cf8", margin: 0 }}>
              {trialDaysLeft != null && trialDaysLeft > 0 ? (
                <>
                  <span style={{ fontWeight: 600, color: "#F2F2F2" }}>{trialDaysLeft}</span>{" "}
                  {trialDaysLeft === 1 ? "day" : "days"} left in your free trial.
                </>
              ) : (
                <>You&apos;re on a free trial — Pro features are unlocked.</>
              )}
            </p>
            <Link href="/pricing" style={{ color: "#818cf8", fontWeight: 600, textDecoration: "none", flexShrink: 0 }}>
              Plans & pricing →
            </Link>
          </div>
        )}

        {onFreePlan && (
          <div
            style={{ marginBottom: 16, display: "flex", flexWrap: "wrap", gap: 12, borderRadius: 8, border: "1px solid rgba(255,255,255,0.07)", background: "rgba(255,255,255,0.02)", padding: "10px 16px", alignItems: "center", justifyContent: "space-between", fontSize: 13 }}
            role="status"
          >
            <p style={{ color: "#8a8f98", margin: 0 }}>
              You&apos;re on the <span style={{ fontWeight: 600, color: "#F2F2F2" }}>Free plan</span> — upgrade to Pro or Mirror for more captures and priority AI.
            </p>
            <Link href="/pricing" style={{ color: "#6366f1", fontWeight: 600, textDecoration: "none", flexShrink: 0 }}>
              Upgrade →
            </Link>
          </div>
        )}

        {!onFreePlan && !trialing && (
          <div
            style={{ marginBottom: 16, display: "flex", flexWrap: "wrap", gap: 12, borderRadius: 8, border: "1px solid rgba(34,197,94,0.12)", background: "rgba(34,197,94,0.06)", padding: "10px 16px", alignItems: "center", justifyContent: "space-between", fontSize: 13 }}
            role="status"
          >
            <p style={{ color: "#86efac", margin: 0 }}>
              You&apos;re on the{" "}
              <span style={{ fontWeight: 600, color: "#F2F2F2" }}>
                {subscription.status === "mirror" ? "Mirror" : subscription.status === "pro" ? "Pro" : subscription.status}
              </span>{" "}
              plan
              {subscription.status === "mirror" ? " — unlimited captures enabled." : " — 150 captures/day enabled."}
            </p>
            <Link href="/pricing" style={{ color: "#22c55e", fontWeight: 600, textDecoration: "none", flexShrink: 0 }}>
              Manage plan →
            </Link>
          </div>
        )}

        {onFreePlan && capturesToday >= 15 && capturesToday < 80 && (
          <div
            style={{ marginBottom: 16, display: "flex", flexWrap: "wrap", gap: 12, borderRadius: 8, border: "1px solid rgba(249,115,22,0.15)", background: "rgba(249,115,22,0.06)", padding: "10px 16px", alignItems: "center", justifyContent: "space-between", fontSize: 13 }}
            role="status"
          >
            <p style={{ color: "#fb923c", margin: 0 }}>
              You&apos;ve used{" "}
              <span style={{ fontWeight: 600, color: "#F2F2F2" }}>{capturesToday}</span>{" "}
              of{" "}
              <span style={{ fontWeight: 600, color: "#F2F2F2" }}>80</span> free captures today — upgrade for unlimited.
            </p>
            <Link href="/pricing" style={{ color: "#fb923c", fontWeight: 600, textDecoration: "none", flexShrink: 0 }}>
              View Pro →
            </Link>
          </div>
        )}

        <section style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginBottom: 24 }} className="grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
          {statCards.map((stat) => (
            <div
              key={stat.label}
              style={{
                background: "rgba(255,255,255,0.02)",
                border: "1px solid rgba(255,255,255,0.07)",
                borderLeft: "2px solid " + stat.border,
                borderRadius: 10,
                padding: 16,
              }}
            >
              <p style={{ fontSize: 9, color: "#525252", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 6, margin: "0 0 6px" }}>
                {stat.label}
              </p>
              <p style={{ fontSize: 26, fontWeight: 700, color: "#F2F2F2", fontFamily: "monospace", letterSpacing: "-0.02em", margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {stat.value}
              </p>
            </div>
          ))}
        </section>

        <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 24 }} className="grid-cols-1 lg:grid-cols-3">
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }} className="lg:col-span-2">

            {/* Recent Activity */}
            <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 10, padding: 20 }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
                <h2 style={{ fontSize: 13, fontWeight: 600, color: "#F2F2F2", margin: 0 }}>Recent Activity</h2>
                <Link href="/dashboard/profile" style={{ fontSize: 13, color: "#6366f1", textDecoration: "none" }}>
                  View all
                </Link>
              </div>
              {observations.length === 0 ? (
                <div style={{ padding: "40px 0", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center" }}>
                  <div style={{ width: 40, height: 40, borderRadius: "50%", background: "rgba(99,102,241,0.08)", marginBottom: 12 }} />
                  <p style={{ color: "#525252", fontSize: 13, margin: 0 }}>Start the desktop app to begin learning.</p>
                </div>
              ) : (
                <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
                  {observations.map((obs) => {
                    const o = obs as {
                      id: string;
                      captured_at: string;
                      app_name?: string;
                      summary?: string;
                      category?: string;
                    };
                    return (
                      <li
                        key={o.id}
                        style={{ display: "flex", alignItems: "flex-start", gap: 10, padding: "10px 0", borderBottom: "1px solid rgba(255,255,255,0.04)" }}
                      >
                        <span
                          style={{
                            width: 6, height: 6, borderRadius: "50%", flexShrink: 0, marginTop: 4,
                            background: (["#6366f1", "#f97316", "#eab308", "#22c55e"])[o.app_name?.length ?? 0 % 4] || "#6366f1",
                          }}
                        />
                        <div style={{ minWidth: 0, flex: 1 }}>
                          <p style={{ margin: 0, fontSize: 13, color: "#8a8f98" }}>
                            {o.app_name && (
                              <span style={{ fontWeight: 600, color: "#818cf8", background: "rgba(99,102,241,0.08)", border: "1px solid rgba(99,102,241,0.15)", borderRadius: 4, padding: "1px 6px", fontSize: 11, marginRight: 6 }}>{o.app_name}</span>
                            )}
                            {o.summary && o.summary}
                          </p>
                          <p style={{ margin: "3px 0 0", fontSize: 11, color: "#3f3f46", fontFamily: "monospace" }}>
                            {new Date(o.captured_at).toLocaleString()}
                          </p>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>

            {/* What Zyph knows */}
            <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 10, padding: 20 }}>
              <h2 style={{ fontSize: 13, fontWeight: 600, color: "#F2F2F2", marginBottom: 16, margin: "0 0 16px" }}>
                What Zyph knows about you
              </h2>
              {profileInsights.length === 0 ? (
                <div style={{ padding: "32px 0", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center" }}>
                  <div className="animate-pulse" style={{ width: 36, height: 36, borderRadius: "50%", background: "rgba(99,102,241,0.15)", marginBottom: 12 }} />
                  <p style={{ color: "#525252", fontSize: 13, margin: 0 }}>Zyph is building your profile…</p>
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                  {Object.entries(insightCategories).map(([category, items]) => (
                    <div key={category}>
                      <p style={{ fontSize: 10, color: "#525252", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 8, margin: "0 0 8px" }}>
                        {category}
                      </p>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                        {items.slice(0, 5).map((insight) => {
                          const i = insight as { id: string; insight_value?: string | null };
                          const text = i.insight_value ?? "";
                          return (
                            <span
                              key={i.id}
                              style={{ background: "rgba(99,102,241,0.08)", border: "1px solid rgba(99,102,241,0.12)", color: "#818cf8", borderRadius: 99, padding: "4px 12px", fontSize: 12 }}
                            >
                              {text.slice(0, 60)}{text.length > 60 ? "…" : ""}
                            </span>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {/* Chat card */}
            <Link
              href="/dashboard/chat"
              style={{
                display: "block",
                background: "linear-gradient(135deg, rgba(99,102,241,0.1) 0%, rgba(99,102,241,0.03) 100%)",
                border: "1px solid rgba(99,102,241,0.18)",
                borderRadius: 10,
                padding: 20,
                textDecoration: "none",
              }}
            >
              <h3 style={{ fontSize: 15, fontWeight: 600, color: "#F2F2F2", marginBottom: 4, margin: "0 0 4px" }}>Chat with Zyph</h3>
              <p style={{ color: "#8a8f98", fontSize: 13, marginBottom: 16, margin: "0 0 16px" }}>Your AI has full context. Ask anything.</p>
              <span style={{ display: "flex", alignItems: "center", justifyContent: "center", width: "100%", padding: "9px 0", borderRadius: 7, fontSize: 13, fontWeight: 600, color: "white", background: "#6366f1" }}>
                Open Chat →
              </span>
              <p style={{ color: "#22c55e", fontSize: 12, marginTop: 10, display: "flex", alignItems: "center", gap: 6 }}>
                <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#22c55e", display: "inline-block" }} />
                Zyph knows you
              </p>
            </Link>

            {/* Quick Stats */}
            <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 10, padding: 20 }}>
              <h3 style={{ fontSize: 13, fontWeight: 600, color: "#F2F2F2", marginBottom: 12, margin: "0 0 12px" }}>Quick Stats</h3>
              <div style={{ display: "flex", gap: 3, alignItems: "flex-end", height: 28, marginBottom: 12 }}>
                {Array.from({ length: 14 }).map((_, i) => {
                  const active = i < Math.min(daysActive, 14);
                  return (
                    <div
                      key={i}
                      style={{
                        flex: 1,
                        borderRadius: 3,
                        background: active ? "#6366f1" : "rgba(255,255,255,0.06)",
                        height: active ? `${12 + (i % 3) * 4}px` : "6px",
                        opacity: active ? 0.8 : 1,
                        minHeight: 4,
                      }}
                    />
                  );
                })}
              </div>
              <p style={{ fontSize: 13, color: "#525252", display: "flex", alignItems: "center", gap: 8, margin: 0 }}>
                {lastActiveDaysAgo === 0 ? (
                  <>
                    <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#22c55e", display: "inline-block" }} />
                    Active today
                  </>
                ) : lastActiveDaysAgo != null ? (
                  <>Last active: {lastActiveDaysAgo} days ago</>
                ) : (
                  <>No activity yet</>
                )}
              </p>
            </div>
          </div>
        </div>
      </div>

      <UpgradeModal
        open={
          storageRead &&
          !loading &&
          onFreePlan &&
          !modalDismissed &&
          (capturesToday >= 80 || fromDesktopLimit)
        }
        onDismiss={() => {
          setModalDismissed(true);
          setFromDesktopLimit(false);
          try {
            sessionStorage.setItem("zyph_upgrade_modal_dismissed", "1");
          } catch {
            /* ignore */
          }
        }}
      />
    </div>
  );
}

function DashboardLoading() {
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

export default function DashboardPage() {
  return (
    <Suspense fallback={<DashboardLoading />}>
      <DashboardContent />
    </Suspense>
  );
}
