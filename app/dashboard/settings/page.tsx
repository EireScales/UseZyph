"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase";
import {
  parseSubscriptionRow,
  type SubscriptionRow,
} from "@/lib/subscription-shared";

type ProfileRow = {
  id: string;
  display_name: string | null;
  settings?: {
    capture_frequency?: string;
    idle_enabled?: boolean;
    categories?: string[];
    data_retention_days?: number;
  } | null;
};

type Toast = { type: "success" | "error"; message: string } | null;

export default function SettingsPage() {
  const router = useRouter();
  const supabase = createSupabaseBrowserClient();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<Toast>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [email, setEmail] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [dataRetentionDays, setDataRetentionDays] = useState(90);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [subscription, setSubscription] = useState<SubscriptionRow | null>(null);
  const [portalLoading, setPortalLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      const {
        data: { user },
        error: sessionError,
      } = await supabase.auth.getUser();
      if (sessionError || !user) {
        router.replace("/auth");
        return;
      }

      setUserId(user.id);
      setEmail(user.email ?? "");

      try {
        const { data } = await supabase
          .from("profiles")
          .select("display_name, settings, subscription")
          .eq("id", user.id)
          .single();

        if (data) {
          const row = data as ProfileRow & { subscription?: unknown };
          setSubscription(parseSubscriptionRow(row.subscription));
          setDisplayName(row.display_name ?? "");
          const s = row.settings;
          if (s && typeof s.data_retention_days === "number")
            setDataRetentionDays(s.data_retention_days);
        }
      } catch (err) {
        console.error("Save error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [router]);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 3000);
    return () => clearTimeout(t);
  }, [toast]);

  const handleSave = async () => {
    if (!userId) return;
    setSaving(true);
    try {
      const { data: row, error: fetchErr } = await supabase
        .from("profiles")
        .select("settings")
        .eq("id", userId)
        .single();
      if (fetchErr) throw fetchErr;
      const prev =
        row?.settings &&
        typeof row.settings === "object" &&
        !Array.isArray(row.settings)
          ? (row.settings as Record<string, unknown>)
          : {};
      const settings = {
        ...prev,
        data_retention_days: dataRetentionDays,
      };
      const { error } = await supabase
        .from("profiles")
        .update({
          display_name: displayName.trim() || null,
          settings,
        })
        .eq("id", userId);

      if (error) throw error;
      setToast({ type: "success", message: "Saved" });
    } catch (err) {
      const message = (err as Error)?.message ?? "Failed to save";
      setToast({ type: "error", message });
    } finally {
      setSaving(false);
    }
  };

  const handleManageSubscription = async () => {
    setPortalLoading(true);
    try {
      const res = await fetch("/api/stripe/portal", {
        method: "POST",
        credentials: "include",
      });
      const data = (await res.json()) as { url?: string; error?: string };
      if (!res.ok) {
        setToast({
          type: "error",
          message: data.error ?? "Could not open billing portal",
        });
        return;
      }
      if (data.url) {
        window.location.href = data.url;
        return;
      }
      setToast({ type: "error", message: "No portal URL returned" });
    } catch {
      setToast({ type: "error", message: "Network error" });
    } finally {
      setPortalLoading(false);
    }
  };

  const handleDeleteAllData = async () => {
    if (!userId) return;
    setDeleting(true);
    try {
      await supabase.from("observations").delete().eq("user_id", userId);
      await supabase.from("user_profile_insights").delete().eq("user_id", userId);
      await supabase
        .from("profiles")
        .update({
          settings: {},
          updated_at: new Date().toISOString(),
        })
        .eq("id", userId);
      setToast({ type: "success", message: "All data deleted" });
      setDeleteModalOpen(false);
    } catch {
      setToast({ type: "error", message: "Failed to delete data" });
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div style={{ display: "flex", minHeight: "100vh", alignItems: "center", justifyContent: "center" }}>
        <div
          className="h-10 w-10 animate-spin rounded-full border-2 border-t-transparent"
          style={{ borderColor: "#6366f1", borderTopColor: "transparent" }}
          aria-label="Loading"
        />
      </div>
    );
  }

  const initial = displayName?.[0]?.toUpperCase() || "?";

  const inputStyle: React.CSSProperties = {
    background: "rgba(255,255,255,0.04)",
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: "8px",
    padding: "10px 14px",
    fontSize: "14px",
    color: "#F2F2F2",
    width: "100%",
    outline: "none",
    fontFamily: "Inter, sans-serif",
    transition: "border-color 0.15s, background 0.15s",
  };

  const sectionLabelStyle: React.CSSProperties = {
    fontSize: "11px",
    fontWeight: 600,
    color: "#525252",
    textTransform: "uppercase",
    letterSpacing: "0.1em",
    marginBottom: "12px",
    fontFamily: "Inter, sans-serif",
  };

  const cardStyle: React.CSSProperties = {
    background: "rgba(255,255,255,0.02)",
    border: "1px solid rgba(255,255,255,0.07)",
    borderRadius: "10px",
    padding: "20px 24px",
  };

  return (
    <div style={{ padding: "32px 40px", animation: "dashboardFadeIn 0.3s ease forwards", fontFamily: "Inter, sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Instrument+Serif:ital,wght@0,400;1,400&family=Inter:wght@400;500;600;700&display=swap');
        .settings-input:focus { border-color: rgba(99,102,241,0.5) !important; background: rgba(255,255,255,0.06) !important; }
        .export-btn:hover { background: rgba(255,255,255,0.04) !important; }
        .delete-btn:hover { background: rgba(239,68,68,0.06) !important; }
        .save-btn:hover:not(:disabled) { opacity: 0.88; }
        .cancel-btn:hover { color: #8a8f98 !important; }
        .confirm-delete-btn:hover { background: rgba(239,68,68,0.08) !important; }
        .pricing-btn:hover { opacity: 0.88; }
        .manage-sub-btn:hover:not(:disabled) { opacity: 0.88; }
      `}</style>

      <div style={{ maxWidth: "900px", margin: "0 auto" }}>

        <h1 style={{ fontSize: "22px", fontWeight: 700, color: "#F2F2F2", letterSpacing: "-0.02em", marginBottom: "32px" }}>
          Settings
        </h1>

        {/* Account */}
        <section style={{ marginBottom: "32px" }}>
          <p style={sectionLabelStyle}>Account</p>
          <div style={{ height: "1px", background: "rgba(255,255,255,0.05)", marginBottom: "20px" }} />
          <div style={cardStyle}>
            <div style={{ display: "flex", alignItems: "flex-start", gap: "20px" }}>
              {/* Avatar */}
              <div
                style={{
                  width: "48px",
                  height: "48px",
                  borderRadius: "10px",
                  background: "linear-gradient(135deg, #6366f1, #818cf8)",
                  fontSize: "20px",
                  fontWeight: 700,
                  color: "#fff",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                {initial}
              </div>

              {/* Fields */}
              <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: "16px" }}>
                <div>
                  <label style={{ display: "block", fontSize: "11px", fontWeight: 500, color: "#525252", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "5px" }}>
                    Display name
                  </label>
                  <input
                    type="text"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    className="settings-input"
                    style={inputStyle}
                    placeholder="Your name"
                  />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "11px", fontWeight: 500, color: "#525252", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "5px" }}>
                    Email
                  </label>
                  <input
                    type="email"
                    value={email}
                    readOnly
                    style={{ ...inputStyle, opacity: 0.5, cursor: "not-allowed" }}
                    placeholder="Email"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Subscription */}
        <section style={{ marginBottom: "32px" }}>
          <p style={sectionLabelStyle}>Subscription</p>
          <div style={{ height: "1px", background: "rgba(255,255,255,0.05)", marginBottom: "20px" }} />
          <div style={cardStyle}>
            <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: "16px" }}>
              <div>
                <p style={{ fontSize: "15px", fontWeight: 600, color: "#F2F2F2", marginBottom: "4px" }}>
                  Billing
                </p>
                <p style={{ fontSize: "13px", color: "#8a8f98", lineHeight: 1.55 }}>
                  {!subscription?.status || subscription.status === "free"
                    ? "Subscribe to Pro or Mirror to unlock higher limits and full history."
                    : subscription.stripe_customer_id
                      ? "Manage your plan, payment method, and invoices in Stripe."
                      : "Your plan is active."}
                </p>
              </div>

              {subscription?.status && subscription.status !== "free" ? (
                subscription.stripe_customer_id ? (
                  <button
                    type="button"
                    onClick={handleManageSubscription}
                    disabled={portalLoading}
                    className="manage-sub-btn"
                    style={{
                      flexShrink: 0,
                      background: "#6366f1",
                      color: "#fff",
                      borderRadius: "8px",
                      padding: "8px 16px",
                      fontSize: "13px",
                      fontWeight: 600,
                      border: "none",
                      cursor: "pointer",
                      opacity: portalLoading ? 0.5 : 1,
                      fontFamily: "Inter, sans-serif",
                      transition: "opacity 0.15s",
                    }}
                  >
                    {portalLoading ? "Opening…" : "Manage subscription"}
                  </button>
                ) : (
                  <span
                    style={{
                      background: "rgba(34,197,94,0.08)",
                      border: "1px solid rgba(34,197,94,0.15)",
                      color: "#86efac",
                      borderRadius: "99px",
                      padding: "5px 14px",
                      fontSize: "12px",
                      fontWeight: 600,
                      fontFamily: "Inter, sans-serif",
                    }}
                  >
                    {subscription.status === "mirror" ? "Mirror plan — active" : "Pro plan — active"}
                  </span>
                )
              ) : (
                <a
                  href="/pricing"
                  className="pricing-btn"
                  style={{
                    flexShrink: 0,
                    background: "#6366f1",
                    color: "#fff",
                    borderRadius: "8px",
                    padding: "8px 16px",
                    fontSize: "13px",
                    fontWeight: 600,
                    border: "none",
                    cursor: "pointer",
                    textDecoration: "none",
                    display: "inline-block",
                    fontFamily: "Inter, sans-serif",
                    transition: "opacity 0.15s",
                  }}
                >
                  View pricing
                </a>
              )}
            </div>
          </div>
        </section>

        {/* Desktop App */}
        <section style={{ marginBottom: "32px" }}>
          <p style={sectionLabelStyle}>Desktop App</p>
          <div style={{ height: "1px", background: "rgba(255,255,255,0.05)", marginBottom: "20px" }} />
          <div style={cardStyle}>
            <p style={{ fontSize: "15px", fontWeight: 600, color: "#F2F2F2", marginBottom: "6px" }}>
              Capture settings
            </p>
            <p style={{ fontSize: "13px", color: "#8a8f98", lineHeight: 1.65 }}>
              Zyph captures every 30 seconds automatically. Pause or resume capturing from the desktop app tray icon.
            </p>
          </div>
        </section>

        {/* Data & Privacy */}
        <section style={{ marginBottom: "32px" }}>
          <p style={sectionLabelStyle}>Data & Privacy</p>
          <div style={{ height: "1px", background: "rgba(255,255,255,0.05)", marginBottom: "20px" }} />

          {/* Data retention */}
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "16px", flexWrap: "wrap" }}>
            <label style={{ fontSize: "13px", color: "#8a8f98", fontFamily: "Inter, sans-serif" }}>
              Data retention
            </label>
            <input
              type="number"
              min={7}
              max={365}
              value={dataRetentionDays}
              onChange={(e) => setDataRetentionDays(Number(e.target.value) || 90)}
              className="settings-input"
              style={{
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.08)",
                color: "#F2F2F2",
                borderRadius: "6px",
                padding: "6px 10px",
                width: "70px",
                fontSize: "14px",
                textAlign: "center",
                outline: "none",
                fontFamily: "Inter, sans-serif",
              }}
            />
            <span style={{ fontSize: "13px", color: "#525252", fontFamily: "Inter, sans-serif" }}>days</span>
          </div>

          {/* Action buttons */}
          <div style={{ display: "flex", flexWrap: "wrap", gap: "10px" }}>
            <button
              type="button"
              onClick={async () => {
                if (!userId) return;
                const { data: obs } = await supabase
                  .from("observations")
                  .select("captured_at, app_name, summary, category")
                  .eq("user_id", userId)
                  .order("captured_at", { ascending: false });
                const { data: ins } = await supabase
                  .from("user_profile_insights")
                  .select("insight_type, insight_value, confidence_score, updated_at")
                  .eq("user_id", userId);
                const blob = new Blob(
                  [JSON.stringify({ observations: obs, insights: ins }, null, 2)],
                  { type: "application/json" }
                );
                const url = URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = url;
                a.download = "zyph-data-export.json";
                a.click();
                URL.revokeObjectURL(url);
              }}
              className="export-btn"
              style={{
                background: "transparent",
                border: "1px solid rgba(255,255,255,0.1)",
                color: "#8a8f98",
                borderRadius: "8px",
                padding: "9px 16px",
                fontSize: "13px",
                cursor: "pointer",
                fontFamily: "Inter, sans-serif",
                transition: "background 0.15s",
              }}
            >
              Export my data
            </button>
            <button
              type="button"
              onClick={() => setDeleteModalOpen(true)}
              className="delete-btn"
              style={{
                background: "transparent",
                border: "1px solid rgba(239,68,68,0.2)",
                color: "#ef4444",
                borderRadius: "8px",
                padding: "9px 16px",
                fontSize: "13px",
                cursor: "pointer",
                fontFamily: "Inter, sans-serif",
                transition: "background 0.15s",
              }}
            >
              Delete all data
            </button>
          </div>
        </section>

        {/* Save button */}
        <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "8px" }}>
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="save-btn"
            style={{
              background: "#6366f1",
              color: "#fff",
              borderRadius: "8px",
              padding: "11px 28px",
              fontSize: "14px",
              fontWeight: 600,
              border: "none",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "8px",
              opacity: saving ? 0.5 : 1,
              fontFamily: "Inter, sans-serif",
              transition: "opacity 0.15s",
            }}
          >
            {saving ? (
              <>
                <span
                  className="w-4 h-4 rounded-full border-2 border-t-transparent animate-spin"
                  style={{ borderColor: "#fff", borderTopColor: "transparent" }}
                  aria-hidden
                />
                Saving…
              </>
            ) : (
              "Save changes"
            )}
          </button>
        </div>
      </div>

      {/* Toast */}
      {toast && (
        <div
          style={{
            position: "fixed",
            bottom: "24px",
            right: "24px",
            zIndex: 50,
            background: "#0e0e0e",
            border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: "10px",
            padding: "12px 16px",
            boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
            display: "flex",
            alignItems: "center",
            gap: "10px",
            fontSize: "13px",
            color: "#F2F2F2",
            fontFamily: "Inter, sans-serif",
          }}
        >
          <span
            style={{
              width: "6px",
              height: "6px",
              borderRadius: "50%",
              flexShrink: 0,
              background: toast.type === "success" ? "#22c55e" : "#ef4444",
            }}
          />
          {toast.message}
        </div>
      )}

      {/* Delete modal */}
      {deleteModalOpen && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 50,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "16px",
            background: "rgba(0,0,0,0.75)",
            backdropFilter: "blur(8px)",
          }}
          onClick={() => !deleting && setDeleteModalOpen(false)}
        >
          <div
            style={{
              background: "#0c0c0f",
              border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: "14px",
              padding: "28px",
              maxWidth: "420px",
              width: "100%",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 style={{ fontSize: "18px", fontWeight: 600, color: "#F2F2F2", letterSpacing: "-0.01em", marginBottom: "8px", fontFamily: "Inter, sans-serif" }}>
              Delete all data?
            </h3>
            <p style={{ fontSize: "14px", color: "#8a8f98", lineHeight: 1.65, marginBottom: "24px", fontFamily: "Inter, sans-serif" }}>
              This will permanently delete all observations and insights. Your
              account will remain; only learned data is removed.
            </p>
            <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end" }}>
              <button
                type="button"
                onClick={() => setDeleteModalOpen(false)}
                disabled={deleting}
                className="cancel-btn"
                style={{
                  background: "transparent",
                  border: "none",
                  color: "#525252",
                  fontSize: "14px",
                  cursor: "pointer",
                  padding: "9px 16px",
                  borderRadius: "8px",
                  fontFamily: "Inter, sans-serif",
                  transition: "color 0.15s",
                }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteAllData}
                disabled={deleting}
                className="confirm-delete-btn"
                style={{
                  background: "transparent",
                  border: "1px solid rgba(239,68,68,0.25)",
                  color: "#ef4444",
                  borderRadius: "8px",
                  padding: "9px 16px",
                  fontSize: "14px",
                  cursor: "pointer",
                  opacity: deleting ? 0.5 : 1,
                  fontFamily: "Inter, sans-serif",
                  transition: "background 0.15s",
                }}
              >
                {deleting ? "Deleting…" : "Yes, delete everything"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
